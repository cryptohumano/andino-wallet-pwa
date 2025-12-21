import { useEffect, useState, useCallback } from 'react'
import { Keyring } from '@polkadot/keyring'
import { cryptoWaitReady, mnemonicGenerate } from '@polkadot/util-crypto'
import { u8aToHex, hexToU8a } from '@polkadot/util'
import type { KeyringPair } from '@polkadot/keyring/types'
import { encrypt, decrypt } from '@/utils/encryption'
import { 
  saveEncryptedAccount, 
  getAllEncryptedAccounts, 
  deleteEncryptedAccount,
  type EncryptedAccount 
} from '@/utils/secureStorage'

export interface KeyringAccount {
  pair: KeyringPair
  address: string
  publicKey: Uint8Array
  meta: {
    name?: string
    [key: string]: any
  }
}

export function useKeyring() {
  const [keyring, setKeyring] = useState<Keyring | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [accounts, setAccounts] = useState<KeyringAccount[]>([])
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [hasStoredAccounts, setHasStoredAccounts] = useState(false)

  useEffect(() => {
    const initKeyring = async () => {
      console.log('[Keyring] Iniciando inicialización...')
      try {
        console.log('[Keyring] Esperando cryptoWaitReady()...')
        await cryptoWaitReady()
        console.log('[Keyring] cryptoWaitReady() completado')
        
        // Crear Keyring sin tipo específico para soportar múltiples tipos (sr25519, ed25519, ecdsa)
        const kr = new Keyring({ ss58Format: 42 })
        setKeyring(kr)
        console.log('[Keyring] Keyring creado exitosamente')
        
        // Verificar si hay cuentas almacenadas
        try {
          console.log('[Keyring] Verificando cuentas almacenadas en IndexedDB...')
          const stored = await getAllEncryptedAccounts()
          console.log(`[Keyring] Cuentas encontradas: ${stored.length}`)
          setHasStoredAccounts(stored.length > 0)
        } catch (error) {
          console.error('[Keyring] ❌ Error al verificar cuentas almacenadas:', error)
          setHasStoredAccounts(false)
        }
        
        setIsReady(true)
        console.log('[Keyring] ✅ Inicialización completada')
      } catch (error) {
        console.error('[Keyring] ❌ Error al inicializar keyring:', error)
        setIsReady(true) // Marcar como listo incluso si hay error para mostrar el componente
      }
    }

    initKeyring()
  }, [])

  const generateMnemonic = useCallback(() => {
    return mnemonicGenerate()
  }, [])

  /**
   * Desbloquea el keyring con una contraseña
   * Carga las cuentas encriptadas desde IndexedDB
   */
  const unlock = useCallback(async (password: string): Promise<boolean> => {
    if (!keyring) return false

    try {
      const encryptedAccounts = await getAllEncryptedAccounts()
      
      if (encryptedAccounts.length === 0) {
        setIsUnlocked(true)
        return true
      }

      // Intentar desencriptar la primera cuenta para verificar la contraseña
      const testAccount = encryptedAccounts[0]
      try {
        await decrypt(testAccount.encryptedData, password)
      } catch {
        return false // Contraseña incorrecta
      }

      // Desencriptar y cargar todas las cuentas
      console.log(`[Keyring] Cargando ${encryptedAccounts.length} cuenta(s)...`)
      const loadedAccounts: KeyringAccount[] = []
      for (const encAccount of encryptedAccounts) {
        try {
          const decryptedData = await decrypt(encAccount.encryptedData, password)
          const { uri, mnemonic, type } = JSON.parse(decryptedData)
          
          // Usar uri si está disponible, sino mnemonic
          const seed = uri || mnemonic
          if (!seed) {
            console.error(`[Keyring] ❌ Cuenta ${encAccount.address} no tiene uri ni mnemonic`)
            continue
          }
          
          const pair = keyring.addFromUri(seed, encAccount.meta, type || 'sr25519')
          loadedAccounts.push({
            pair,
            address: pair.address,
            publicKey: pair.publicKey,
            meta: pair.meta,
          })
          console.log(`[Keyring] ✅ Cuenta cargada: ${pair.address}`)
        } catch (error) {
          console.error(`[Keyring] ❌ Error al cargar cuenta ${encAccount.address}:`, error)
        }
      }

      console.log(`[Keyring] ✅ ${loadedAccounts.length} cuenta(s) cargada(s) exitosamente`)
      setAccounts(loadedAccounts)
      setIsUnlocked(true)
      return true
    } catch (error) {
      console.error('Error al desbloquear keyring:', error)
      return false
    }
  }, [keyring])

  /**
   * Bloquea el keyring, eliminando las claves de memoria
   */
  const lock = useCallback(() => {
    if (!keyring) return
    
    // Remover todos los pares del keyring
    accounts.forEach(acc => {
      try {
        keyring.removePair(acc.address)
      } catch {}
    })
    
    setAccounts([])
    setIsUnlocked(false)
  }, [keyring, accounts])

  const addFromMnemonic = useCallback(async (mnemonic: string, name?: string, type: 'sr25519' | 'ed25519' | 'ecdsa' = 'sr25519', password?: string): Promise<KeyringAccount | null> => {
    if (!keyring || !isUnlocked) return null

    const pair = keyring.addFromUri(mnemonic, { name: name || 'Account' }, type)
    const account: KeyringAccount = {
      pair,
      address: pair.address,
      publicKey: pair.publicKey,
      meta: pair.meta,
    }

    setAccounts((prev) => [...prev, account])

    // Guardar encriptado si hay contraseña
    if (password) {
      try {
        const encryptedData = await encrypt(JSON.stringify({ mnemonic, type }), password)
        await saveEncryptedAccount({
          address: account.address,
          encryptedData,
          publicKey: u8aToHex(account.publicKey),
          meta: account.meta,
          createdAt: Date.now(),
        })
      } catch (error) {
        console.error('Error al guardar cuenta encriptada:', error)
      }
    }

    return account
  }, [keyring, isUnlocked])

  const addFromUri = useCallback(async (uri: string, name?: string, type: 'sr25519' | 'ed25519' | 'ecdsa' = 'sr25519', password?: string): Promise<KeyringAccount | null> => {
    if (!keyring || !isUnlocked) return null

    const pair = keyring.addFromUri(uri, { name: name || 'Account' }, type)
    const account: KeyringAccount = {
      pair,
      address: pair.address,
      publicKey: pair.publicKey,
      meta: pair.meta,
    }

    setAccounts((prev) => [...prev, account])

    // Guardar encriptado si hay contraseña
    if (password) {
      try {
        const encryptedData = await encrypt(JSON.stringify({ uri, type }), password)
        await saveEncryptedAccount({
          address: account.address,
          encryptedData,
          publicKey: u8aToHex(account.publicKey),
          meta: account.meta,
          createdAt: Date.now(),
        })
        // Actualizar hasStoredAccounts después de guardar
        setHasStoredAccounts(true)
      } catch (error) {
        console.error('Error al guardar cuenta encriptada:', error)
        throw error
      }
    }

    return account
  }, [keyring, isUnlocked])

  const removeAccount = useCallback(async (address: string) => {
    if (!keyring) return false

    try {
      keyring.removePair(address)
      setAccounts((prev) => prev.filter((acc) => acc.address !== address))
      
      // Eliminar de IndexedDB
      await deleteEncryptedAccount(address)
      
      // Actualizar hasStoredAccounts
      const remaining = await getAllEncryptedAccounts()
      setHasStoredAccounts(remaining.length > 0)
      
      return true
    } catch (error) {
      console.error('Error al eliminar cuenta:', error)
      return false
    }
  }, [keyring])

  const getAccount = useCallback((address: string) => {
    return accounts.find((acc) => acc.address === address)
  }, [accounts])

  const setSS58Format = useCallback((format: number) => {
    if (!keyring) return
    keyring.setSS58Format(format)
    // Actualizar direcciones de todas las cuentas
    setAccounts((prev) => prev.map((acc) => ({
      ...acc,
      address: acc.pair.address,
    })))
  }, [keyring])

  return {
    keyring,
    isReady,
    accounts,
    isUnlocked,
    hasStoredAccounts,
    generateMnemonic,
    unlock,
    lock,
    addFromMnemonic,
    addFromUri,
    removeAccount,
    getAccount,
    setSS58Format,
  }
}

