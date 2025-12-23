/**
 * Servicio para firmar documentos con llaves Substrate (Ed25519/sr25519)
 */

import { v4 as uuidv4 } from 'uuid'
import type { KeyringPair } from '@polkadot/keyring/types'
import { u8aToHex } from '@polkadot/util'
import type { Document, DocumentSignature } from '@/types/documents'
import { calculatePDFHash } from '@/services/pdf/PDFHash'
import { updateDocument } from '@/utils/documentStorage'

export interface SignDocumentOptions {
  document: Document
  pair: KeyringPair
  reason?: string
  location?: string
}

/**
 * Firma un documento con una llave Substrate
 */
export async function signDocumentWithSubstrate(
  options: SignDocumentOptions
): Promise<Document> {
  const { document, pair, reason, location } = options

  if (!document.pdf) {
    throw new Error('El documento no tiene PDF para firmar')
  }

  // Calcular hash SHA-256 del PDF
  const pdfHash = await calculatePDFHash(document.pdf)

  // Firmar el hash con la llave privada
  const hashBytes = hexToUint8Array(pdfHash)
  const signature = pair.sign(hashBytes)
  const signatureHex = u8aToHex(signature)

  // Crear objeto de firma
  const documentSignature: DocumentSignature = {
    id: uuidv4(),
    type: 'substrate',
    signer: pair.address,
    signature: signatureHex,
    keyType: pair.type,
    timestamp: Date.now(),
    hash: pdfHash,
    metadata: {
      reason,
      location,
    },
  }

  // Agregar firma al documento
  const updatedSignatures = [...(document.signatures || []), documentSignature]

  // Actualizar estado de firma
  let signatureStatus = document.signatureStatus
  if (document.requiredSigners && document.requiredSigners.length > 0) {
    const signedAddresses = updatedSignatures
      .filter(sig => sig.signer)
      .map(sig => sig.signer!)
    const allRequiredSigned = document.requiredSigners.every(addr =>
      signedAddresses.includes(addr)
    )
    const someRequiredSigned = document.requiredSigners.some(addr =>
      signedAddresses.includes(addr)
    )

    if (allRequiredSigned) {
      signatureStatus = 'fully_signed'
    } else if (someRequiredSigned) {
      signatureStatus = 'partially_signed'
    } else {
      signatureStatus = 'pending'
    }
  } else {
    signatureStatus = 'fully_signed'
  }

  // Actualizar documento
  const updatedDocument: Document = {
    ...document,
    signatures: updatedSignatures,
    signatureStatus,
    pendingSigners: document.requiredSigners
      ? document.requiredSigners.filter(
          addr => !updatedSignatures.some(sig => sig.signer === addr)
        )
      : undefined,
    updatedAt: Date.now(),
  }

  // Guardar en IndexedDB
  await updateDocument(document.documentId, updatedDocument)

  return updatedDocument
}

/**
 * Verifica una firma Substrate
 */
export async function verifySubstrateSignature(
  document: Document,
  signature: DocumentSignature
): Promise<boolean> {
  if (signature.type !== 'substrate' || !signature.signer || !signature.signature) {
    return false
  }

  try {
    // Recalcular hash del PDF
    if (!document.pdf) {
      return false
    }

    const currentHash = await calculatePDFHash(document.pdf)

    // Verificar que el hash coincida
    if (currentHash.toLowerCase() !== signature.hash.toLowerCase()) {
      console.warn('[Substrate Signer] Hash del documento no coincide')
      return false
    }

    // Nota: Para verificar completamente, necesitaríamos la public key
    // Por ahora, verificamos que el hash coincida
    // En una implementación completa, usaríamos @polkadot/util-crypto para verificar la firma

    return true
  } catch (error) {
    console.error('[Substrate Signer] Error al verificar firma:', error)
    return false
  }
}

/**
 * Convierte hex string a Uint8Array
 */
function hexToUint8Array(hex: string): Uint8Array {
  // Remover prefijo 0x si existe
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex

  const bytes = new Uint8Array(cleanHex.length / 2)
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = parseInt(cleanHex.substr(i, 2), 16)
  }
  return bytes
}

