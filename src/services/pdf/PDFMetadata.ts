/**
 * Utilidades para manejar metadata GPS y EXIF en PDFs
 */

import type { GPSMetadata } from '@/types/documents'
import jsPDF from 'jspdf'

/**
 * Inyecta metadata GPS en un documento PDF
 */
export function injectGPSMetadata(
  pdf: jsPDF,
  gpsMetadata: GPSMetadata
): void {
  // jsPDF permite agregar metadata personalizada
  const metadata = {
    title: pdf.getMetadata()?.title || '',
    author: pdf.getMetadata()?.author || '',
    subject: pdf.getMetadata()?.subject || '',
    keywords: pdf.getMetadata()?.keywords || '',
    creator: 'Aura Wallet',
    producer: 'Aura Wallet PDF Generator',
    // Metadata GPS personalizada
    custom: {
      gps: {
        latitude: gpsMetadata.latitude,
        longitude: gpsMetadata.longitude,
        altitude: gpsMetadata.altitude,
        accuracy: gpsMetadata.accuracy,
        timestamp: gpsMetadata.timestamp,
      },
    },
  }

  // Nota: jsPDF tiene limitaciones para metadata personalizada
  // En una implementación completa, podríamos usar pdf-lib para esto
  // Por ahora, guardamos la metadata GPS en el objeto Document de IndexedDB
}

/**
 * Obtiene la ubicación GPS actual del usuario
 */
export async function getCurrentGPSLocation(): Promise<GPSMetadata | null> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocalización no está disponible'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          altitude: position.coords.altitude || undefined,
          accuracy: position.coords.accuracy || undefined,
          timestamp: position.timestamp,
        })
      },
      (error) => {
        reject(error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  })
}

/**
 * Extrae metadata EXIF de una imagen
 * Nota: Para una implementación completa, necesitaríamos exif-js
 */
export async function extractEXIFMetadata(imageFile: File): Promise<{
  gps?: GPSMetadata
  dateTime?: string
  [key: string]: any
}> {
  // Implementación básica - en producción usaríamos exif-js
  return new Promise((resolve) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const result = e.target?.result
      if (result instanceof ArrayBuffer) {
        // Aquí procesaríamos los datos EXIF
        // Por ahora retornamos un objeto vacío
        resolve({})
      } else {
        resolve({})
      }
    }
    
    reader.onerror = () => {
      resolve({})
    }
    
    reader.readAsArrayBuffer(imageFile)
  })
}

/**
 * Convierte coordenadas GPS a formato de metadata PDF
 */
export function formatGPSForPDF(gps: GPSMetadata): {
  Latitude: number
  Longitude: number
  Altitude?: number
} {
  return {
    Latitude: gps.latitude,
    Longitude: gps.longitude,
    ...(gps.altitude !== undefined && { Altitude: gps.altitude }),
  }
}

