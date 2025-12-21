/**
 * Utilidades para derivar direcciones Ethereum desde cuentas Substrate
 * 
 * Para derivar una dirección Ethereum desde una cuenta Substrate:
 * 1. Usar el mismo seed/mnemonic pero crear una cuenta ECDSA
 * 2. Obtener la clave pública ECDSA
 * 3. Aplicar keccak256 a la clave pública (sin el primer byte 0x04)
 * 4. Tomar los últimos 20 bytes como dirección Ethereum
 */

import { Keyring } from '@polkadot/keyring'
import { keccakAsHex, keccakAsU8a } from '@polkadot/util-crypto'
import { u8aToHex, hexToU8a } from '@polkadot/util'
import type { KeyringPair } from '@polkadot/keyring/types'

/**
 * Deriva una dirección Ethereum desde un seed/mnemonic/URI de Substrate
 * @param seed - El seed, mnemonic o URI de Substrate (ej: "//Alice", mnemonic, etc.)
 * @returns La dirección Ethereum (0x...)
 */
export function deriveEthereumAddress(seed: string): string {
  try {
    // Crear un keyring temporal para ECDSA
    const keyring = new Keyring({ type: 'ecdsa' })
    
    // Crear el par desde el seed
    const pair = keyring.addFromUri(seed)
    
    // Obtener la clave pública (65 bytes para ECDSA: 0x04 + 32 bytes X + 32 bytes Y)
    const publicKey = pair.publicKey
    
    // Para Ethereum, necesitamos la clave pública sin el prefijo 0x04
    // La clave pública ECDSA tiene formato: 0x04 + X (32 bytes) + Y (32 bytes)
    // Ethereum usa solo X + Y (64 bytes total)
    const publicKeyWithoutPrefix = publicKey.slice(1) // Remover el primer byte (0x04)
    
    // Aplicar keccak256
    const hash = keccakAsU8a(publicKeyWithoutPrefix)
    
    // Tomar los últimos 20 bytes (40 caracteres hex)
    const addressBytes = hash.slice(-20)
    
    // Convertir a dirección Ethereum con prefijo 0x
    return u8aToHex(addressBytes)
  } catch (error) {
    console.error('Error al derivar dirección Ethereum:', error)
    throw new Error(`No se pudo derivar la dirección Ethereum: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Deriva una dirección Ethereum desde un KeyringPair existente
 * Nota: Esto requiere acceso al seed original, que no está disponible desde el pair
 * Por lo tanto, esta función intenta derivar desde el pair si es ECDSA,
 * o requiere que se pase el seed original
 * 
 * @param pair - El KeyringPair de Substrate
 * @param seed - (Opcional) El seed original si el pair no es ECDSA
 * @returns La dirección Ethereum (0x...)
 */
export function deriveEthereumAddressFromPair(pair: KeyringPair, seed?: string): string | null {
  try {
    // Si el pair ya es ECDSA, podemos derivar directamente
    if (pair.type === 'ecdsa') {
      const publicKey = pair.publicKey
      const publicKeyWithoutPrefix = publicKey.slice(1)
      const hash = keccakAsU8a(publicKeyWithoutPrefix)
      const addressBytes = hash.slice(-20)
      return u8aToHex(addressBytes)
    }
    
    // Si no es ECDSA y tenemos el seed, derivar desde el seed
    if (seed) {
      return deriveEthereumAddress(seed)
    }
    
    // No podemos derivar sin el seed original
    return null
  } catch (error) {
    console.error('Error al derivar dirección Ethereum desde pair:', error)
    return null
  }
}

/**
 * Verifica si una dirección Ethereum es válida
 * @param address - La dirección a verificar
 * @returns true si es válida
 */
export function isValidEthereumAddress(address: string): boolean {
  if (!address || !address.startsWith('0x')) return false
  if (address.length !== 42) return false // 0x + 40 caracteres hex
  
  // Verificar que todos los caracteres después de 0x sean hexadecimales
  const hexPart = address.slice(2)
  return /^[0-9a-fA-F]{40}$/.test(hexPart)
}

