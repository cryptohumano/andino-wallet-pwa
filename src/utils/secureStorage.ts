/**
 * Almacenamiento seguro usando IndexedDB
 * Las claves privadas se almacenan encriptadas
 * 
 * IndexedDB es una base de datos NoSQL (no relacional) que funciona en el navegador.
 * - No usa tablas con relaciones (JOINs) como SQL
 * - Almacena objetos JavaScript directamente
 * - Soporta índices para búsquedas rápidas
 * - Soporta transacciones ACID
 * - Permite migraciones de schema mediante versiones
 */

const DB_NAME = 'pwa-substrate-keyring'
const DB_VERSION = 2 // Incrementado para agregar índices
const STORE_NAME = 'encrypted-accounts'

export interface EncryptedAccount {
  address: string // Clave primaria (keyPath)
  encryptedData: string // JSON encriptado con la clave privada (seed/mnemonic)
  publicKey: string // Public key en hex
  type?: 'sr25519' | 'ed25519' | 'ecdsa' // Tipo de criptografía
  ethereumAddress?: string // Dirección Ethereum derivada (opcional)
  meta: {
    name?: string
    tags?: string[] // Etiquetas para organización
    notes?: string // Notas del usuario
    [key: string]: any
  }
  createdAt: number
  updatedAt: number
}

let dbInstance: IDBDatabase | null = null

async function openDB(): Promise<IDBDatabase> {
  if (dbInstance) {
    console.log('[IndexedDB] Usando instancia existente')
    return dbInstance
  }

  // Verificar que IndexedDB esté disponible
  if (!('indexedDB' in window)) {
    const error = new Error('IndexedDB no está disponible en este navegador')
    console.error('[IndexedDB] ❌', error.message)
    throw error
  }

  console.log(`[IndexedDB] Abriendo base de datos: ${DB_NAME} (versión ${DB_VERSION})`)

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      const error = request.error || new Error('No se pudo abrir IndexedDB')
      console.error('[IndexedDB] ❌ Error al abrir:', error)
      reject(error)
    }
    
    request.onsuccess = () => {
      dbInstance = request.result
      console.log('[IndexedDB] ✅ Base de datos abierta exitosamente')
      resolve(dbInstance)
    }

    request.onupgradeneeded = (event) => {
      console.log('[IndexedDB] Actualizando base de datos...')
      const db = (event.target as IDBOpenDBRequest).result
      const oldVersion = event.oldVersion || 0
      const newVersion = event.newVersion || DB_VERSION

      console.log(`[IndexedDB] Migrando de versión ${oldVersion} a ${newVersion}`)

      // Si es una instalación nueva (sin versión anterior)
      if (oldVersion === 0) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'address' })
        
        // Crear índices
        store.createIndex('byType', 'type', { unique: false })
        store.createIndex('byCreatedAt', 'createdAt', { unique: false })
        store.createIndex('byName', 'meta.name', { unique: false })
        
        console.log(`[IndexedDB] ObjectStore '${STORE_NAME}' creado con índices`)
      } else {
        // Migración de versión 1 a 2: Agregar índices
        if (oldVersion < 2) {
          // Obtener el object store existente
          const transaction = (event.target as IDBOpenDBRequest).transaction
          if (!transaction) {
            console.error('[IndexedDB] No se pudo obtener la transacción de migración')
            return
          }
          
          const store = transaction.objectStore(STORE_NAME)

          // Crear índices para búsquedas eficientes (solo si no existen)
          if (!store.indexNames.contains('byType')) {
            store.createIndex('byType', 'type', { unique: false })
            console.log('[IndexedDB] Índice "byType" creado')
          }
          
          if (!store.indexNames.contains('byCreatedAt')) {
            store.createIndex('byCreatedAt', 'createdAt', { unique: false })
            console.log('[IndexedDB] Índice "byCreatedAt" creado')
          }

          if (!store.indexNames.contains('byName')) {
            // Índice en meta.name (path anidado)
            store.createIndex('byName', 'meta.name', { unique: false })
            console.log('[IndexedDB] Índice "byName" creado')
          }

          // Migrar datos existentes: agregar campos faltantes
          const getAllRequest = store.getAll()
          getAllRequest.onsuccess = () => {
            const accounts = getAllRequest.result as EncryptedAccount[]
            let updated = 0
            accounts.forEach((account) => {
              let needsUpdate = false
              const updatedAccount = { ...account }
              
              if (!updatedAccount.updatedAt) {
                updatedAccount.updatedAt = updatedAccount.createdAt || Date.now()
                needsUpdate = true
              }
              if (!updatedAccount.type) {
                updatedAccount.type = 'sr25519' // Valor por defecto
                needsUpdate = true
              }
              
              if (needsUpdate) {
                store.put(updatedAccount)
                updated++
              }
            })
            if (updated > 0) {
              console.log(`[IndexedDB] ${updated} cuenta(s) actualizada(s) durante la migración`)
            }
            console.log('[IndexedDB] Migración a versión 2 completada')
          }
          getAllRequest.onerror = () => {
            console.error('[IndexedDB] Error al migrar datos:', getAllRequest.error)
          }
        }
      }
    }
    
    request.onblocked = () => {
      console.warn('[IndexedDB] ⚠️ Base de datos bloqueada. Cierra otras pestañas que usen esta base de datos.')
    }
  })
}

export async function saveEncryptedAccount(account: EncryptedAccount): Promise<void> {
  console.log(`[IndexedDB] Guardando cuenta: ${account.address}`)
  
  // Validar datos antes de guardar
  if (!account.address) {
    throw new Error('La dirección de la cuenta es requerida')
  }
  if (!account.encryptedData) {
    throw new Error('Los datos encriptados son requeridos')
  }
  
  // Asegurar que createdAt y updatedAt estén presentes
  const now = Date.now()
  const accountToSave: EncryptedAccount = {
    ...account,
    createdAt: account.createdAt || now,
    updatedAt: now,
  }

  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.put(accountToSave)

    request.onsuccess = () => {
      console.log(`[IndexedDB] ✅ Cuenta guardada: ${accountToSave.address}`)
      resolve()
    }
    request.onerror = () => {
      console.error(`[IndexedDB] ❌ Error al guardar cuenta ${accountToSave.address}:`, request.error)
      reject(request.error)
    }
  })
}

export async function getEncryptedAccount(address: string): Promise<EncryptedAccount | null> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.get(address)

    request.onsuccess = () => resolve(request.result || null)
    request.onerror = () => reject(request.error)
  })
}

export async function getAllEncryptedAccounts(): Promise<EncryptedAccount[]> {
  console.log('[IndexedDB] Obteniendo todas las cuentas...')
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.getAll()

    request.onsuccess = () => {
      const accounts = request.result || []
      console.log(`[IndexedDB] ✅ ${accounts.length} cuenta(s) encontrada(s)`)
      resolve(accounts)
    }
    request.onerror = () => {
      console.error('[IndexedDB] ❌ Error al obtener cuentas:', request.error)
      reject(request.error)
    }
  })
}

export async function deleteEncryptedAccount(address: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.delete(address)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export async function clearAllAccounts(): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.clear()

    request.onsuccess = () => {
      console.log('[IndexedDB] ✅ Todas las cuentas eliminadas')
      resolve()
    }
    request.onerror = () => reject(request.error)
  })
}

/**
 * Buscar cuentas por tipo de criptografía usando el índice
 */
export async function getAccountsByType(type: 'sr25519' | 'ed25519' | 'ecdsa'): Promise<EncryptedAccount[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const index = store.index('byType')
    const request = index.getAll(type)

    request.onsuccess = () => {
      const accounts = request.result || []
      console.log(`[IndexedDB] ✅ ${accounts.length} cuenta(s) encontrada(s) con tipo ${type}`)
      resolve(accounts)
    }
    request.onerror = () => {
      console.error('[IndexedDB] ❌ Error al buscar por tipo:', request.error)
      reject(request.error)
    }
  })
}

/**
 * Buscar cuentas por nombre usando el índice
 */
export async function searchAccountsByName(name: string): Promise<EncryptedAccount[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const index = store.index('byName')
    const request = index.getAll(name)

    request.onsuccess = () => {
      const accounts = request.result || []
      console.log(`[IndexedDB] ✅ ${accounts.length} cuenta(s) encontrada(s) con nombre "${name}"`)
      resolve(accounts)
    }
    request.onerror = () => {
      console.error('[IndexedDB] ❌ Error al buscar por nombre:', request.error)
      reject(request.error)
    }
  })
}

/**
 * Obtener cuentas ordenadas por fecha de creación
 */
export async function getAccountsSortedByDate(ascending: boolean = false): Promise<EncryptedAccount[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const index = store.index('byCreatedAt')
    const request = index.getAll()
    
    request.onsuccess = () => {
      const accounts = (request.result || []) as EncryptedAccount[]
      // Ordenar manualmente (IndexedDB no garantiza orden con getAll)
      accounts.sort((a, b) => {
        const diff = a.createdAt - b.createdAt
        return ascending ? diff : -diff
      })
      console.log(`[IndexedDB] ✅ ${accounts.length} cuenta(s) ordenadas por fecha`)
      resolve(accounts)
    }
    request.onerror = () => {
      console.error('[IndexedDB] ❌ Error al obtener cuentas ordenadas:', request.error)
      reject(request.error)
    }
  })
}

export type { EncryptedAccount }

