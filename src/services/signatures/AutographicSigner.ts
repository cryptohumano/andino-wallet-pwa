/**
 * Servicio para agregar firmas autográficas a PDFs
 */

import { v4 as uuidv4 } from 'uuid'
import { PDFDocument } from 'pdf-lib'
import type { Document, DocumentSignature, GPSMetadata } from '@/types/documents'
import { updateDocument } from '@/utils/documentStorage'
import { calculatePDFHash } from '@/services/pdf/PDFHash'
import { getCurrentGPSLocation } from '@/services/pdf/PDFMetadata'

export interface AddAutographicSignatureOptions {
  document: Document
  signatureImage: string // Base64 PNG de la firma
  position: {
    page: number
    x: number // mm desde la izquierda
    y: number // mm desde arriba
    width?: number // mm
    height?: number // mm
  }
  captureGPS?: boolean
}

/**
 * Agrega una firma autográfica a un PDF
 */
export async function addAutographicSignature(
  options: AddAutographicSignatureOptions
): Promise<Document> {
  const { document, signatureImage, position, captureGPS = false } = options

  if (!document.pdf) {
    throw new Error('El documento no tiene PDF para firmar')
  }

  // Convertir base64 a Uint8Array
  const pdfBytes = base64ToUint8Array(document.pdf)

  // Cargar PDF con pdf-lib
  const pdfDoc = await PDFDocument.load(pdfBytes)

  // Obtener página
  const pages = pdfDoc.getPages()
  if (position.page < 0 || position.page >= pages.length) {
    throw new Error(`Página ${position.page} no existe en el documento`)
  }
  const page = pages[position.page]

  // Convertir imagen de firma
  const signatureImageBytes = base64ToUint8Array(signatureImage.split(',')[1] || signatureImage)
  const signatureImageEmbed = await pdfDoc.embedPng(signatureImageBytes)

  // Calcular dimensiones
  const width = position.width || 60 // mm por defecto
  const height = position.height || 30 // mm por defecto

  // Convertir mm a puntos (1 mm = 2.83465 puntos)
  const mmToPoints = 2.83465
  const xPoints = position.x * mmToPoints
  const yPoints = position.y * mmToPoints
  const widthPoints = width * mmToPoints
  const heightPoints = height * mmToPoints

  // Incrustar imagen en el PDF
  page.drawImage(signatureImageEmbed, {
    x: xPoints,
    y: page.getHeight() - yPoints - heightPoints, // Y se mide desde abajo
    width: widthPoints,
    height: heightPoints,
  })

  // Guardar PDF modificado
  const modifiedPdfBytes = await pdfDoc.save()
  const modifiedPdfBase64 = uint8ArrayToBase64(modifiedPdfBytes)

  // Calcular nuevo hash
  const newHash = await calculatePDFHash(modifiedPdfBase64)

  // Obtener GPS si se solicita
  let gpsMetadata: GPSMetadata | undefined
  if (captureGPS) {
    try {
      gpsMetadata = await getCurrentGPSLocation()
    } catch (error) {
      console.warn('[Autographic Signer] No se pudo obtener GPS:', error)
    }
  }

  // Crear objeto de firma
  const documentSignature: DocumentSignature = {
    id: uuidv4(),
    type: 'autographic',
    autographic: {
      image: signatureImage,
      position: {
        page: position.page,
        x: position.x,
        y: position.y,
        width,
        height,
      },
      capturedAt: Date.now(),
      gpsMetadata,
    },
    timestamp: Date.now(),
    hash: newHash,
  }

  // Agregar firma al documento
  const updatedSignatures = [...(document.signatures || []), documentSignature]

  // Actualizar documento
  const updatedDocument: Document = {
    ...document,
    pdf: modifiedPdfBase64,
    pdfHash: newHash,
    pdfSize: modifiedPdfBytes.length,
    signatures: updatedSignatures,
    updatedAt: Date.now(),
  }

  // Guardar en IndexedDB
  await updateDocument(document.documentId, updatedDocument)

  return updatedDocument
}

/**
 * Convierte base64 a Uint8Array
 */
function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes
}

/**
 * Convierte Uint8Array a base64
 */
function uint8ArrayToBase64(uint8Array: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < uint8Array.length; i++) {
    binary += String.fromCharCode(uint8Array[i])
  }
  return btoa(binary)
}

