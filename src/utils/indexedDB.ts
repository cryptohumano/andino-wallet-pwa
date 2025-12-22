/**
 * Módulo compartido para manejar la conexión a IndexedDB
 * Evita conflictos cuando múltiples módulos intentan abrir la misma base de datos
 */

const DB_NAME = 'pwa-substrate-keyring'
const DB_VERSION = 4 // Incrementado para manejar la versión actual

let dbInstance: IDBDatabase | null = null
let openPromise: Promise<IDBDatabase> | null = null

/**
 * Abre la base de datos compartida
 * Si ya hay una conexión abierta, la reutiliza
 * Si hay una conexión en progreso, espera a que termine
 */
export async function openSharedDB(): Promise<IDBDatabase> {
  // Si ya hay una instancia, devolverla
  if (dbInstance) {
    console.log('[IndexedDB Shared] Usando instancia existente')
    return dbInstance
  }

  // Si hay una conexión en progreso, esperar a que termine
  if (openPromise) {
    console.log('[IndexedDB Shared] Esperando conexión en progreso...')
    return openPromise
  }

  if (!('indexedDB' in window)) {
    throw new Error('IndexedDB no está disponible en este navegador')
  }

  // Verificar si IndexedDB está disponible y no está bloqueado
  try {
    const databases = await indexedDB.databases()
    console.log('[IndexedDB Shared] Bases de datos existentes:', databases.map(db => ({ name: db.name, version: db.version })))
  } catch (err) {
    console.warn('[IndexedDB Shared] No se pudo listar bases de datos:', err)
  }

  console.log(`[IndexedDB Shared] Abriendo base de datos: ${DB_NAME} (versión ${DB_VERSION})`)

  openPromise = new Promise((resolve, reject) => {
    let request: IDBOpenDBRequest | null = null
    let timeoutId: NodeJS.Timeout | null = null
    let isResolved = false
    
    const cleanup = () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
    }
    
    const resolveOnce = (db: IDBDatabase) => {
      if (isResolved) return
      isResolved = true
      cleanup()
      dbInstance = db
      openPromise = null
      console.log('[IndexedDB Shared] ✅ Base de datos abierta exitosamente')
      console.log('[IndexedDB Shared] Object stores disponibles:', Array.from(db.objectStoreNames))
      resolve(db)
    }
    
    const rejectOnce = (error: Error) => {
      if (isResolved) return
      isResolved = true
      cleanup()
      openPromise = null
      console.error('[IndexedDB Shared] ❌', error.message)
      reject(error)
    }
    
    try {
      request = indexedDB.open(DB_NAME, DB_VERSION)
      console.log('[IndexedDB Shared] Request creado, esperando respuesta...')
      console.log('[IndexedDB Shared] Request readyState:', request.readyState)
      // NO acceder a request.result aquí - causará InvalidStateError
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      console.error('[IndexedDB Shared] ❌ Error al crear request:', error)
      rejectOnce(error)
      return
    }

    // Timeout para evitar que se quede colgado (aumentado a 15 segundos)
    timeoutId = setTimeout(() => {
      const error = new Error('Timeout al abrir IndexedDB (15 segundos). La base de datos puede estar bloqueada o corrupta. Intenta cerrar otras pestañas o eliminar la base de datos desde las herramientas de desarrollador.')
      console.error('[IndexedDB Shared] ❌', error.message)
      if (request) {
        console.error('[IndexedDB Shared] Estado del request:', {
          readyState: request.readyState,
          error: request.error
        })
        // Intentar abortar el request
        try {
          // No podemos abortar directamente, pero podemos cerrar la conexión si se abre después
        } catch (e) {
          console.warn('[IndexedDB Shared] No se pudo abortar el request:', e)
        }
      }
      rejectOnce(error)
    }, 15000)

    const req = request

    req.onerror = () => {
      const error = req.error || new Error('No se pudo abrir IndexedDB')
      
      // Si es un error de versión, intentar abrir sin especificar versión
      if (error.name === 'VersionError') {
        console.warn('[IndexedDB Shared] ⚠️ Error de versión, intentando abrir sin especificar versión...')
        dbInstance = null
        openPromise = null
        
        const fallbackRequest = indexedDB.open(DB_NAME)
        
        fallbackRequest.onsuccess = () => {
          if (!fallbackRequest.result) {
            rejectOnce(new Error('Apertura sin versión exitosa pero sin resultado'))
            return
          }
          console.log('[IndexedDB Shared] ✅ Base de datos abierta sin especificar versión')
          resolveOnce(fallbackRequest.result)
        }
        
        fallbackRequest.onerror = () => {
          const fallbackError = fallbackRequest.error || new Error('Error al abrir sin versión')
          console.error('[IndexedDB Shared] ❌ Error al abrir sin versión:', fallbackError)
          rejectOnce(fallbackError as Error)
        }
        
        return
      }
      
      console.error('[IndexedDB Shared] ❌ Error al abrir:', error)
      console.error('[IndexedDB Shared] Detalles del error:', {
        name: error.name,
        message: error.message,
        code: (error as any).code,
        stack: error.stack
      })
      rejectOnce(error)
    }

    req.onsuccess = () => {
      console.log('[IndexedDB Shared] ✅ Request.onsuccess ejecutado')
      if (!req.result) {
        const error = new Error('Request exitoso pero sin resultado')
        console.error('[IndexedDB Shared] ❌', error.message)
        rejectOnce(error)
        return
      }
      
      const db = req.result
      const STORE_NAME = 'encrypted-accounts'
      const WEBAUTHN_STORE_NAME = 'webauthn-credentials'
      
      // Verificar que los stores existan
      const hasAccountsStore = db.objectStoreNames.contains(STORE_NAME)
      const hasWebAuthnStore = db.objectStoreNames.contains(WEBAUTHN_STORE_NAME)
      
      console.log('[IndexedDB Shared] Stores disponibles:', Array.from(db.objectStoreNames))
      
      if (!hasAccountsStore || !hasWebAuthnStore) {
        console.warn('[IndexedDB Shared] ⚠️ Faltan stores, cerrando y eliminando base de datos para recrearla...')
        db.close()
        dbInstance = null
        openPromise = null
        
        // Eliminar y recrear la base de datos
        const deleteRequest = indexedDB.deleteDatabase(DB_NAME)
        
        deleteRequest.onsuccess = () => {
          console.log('[IndexedDB Shared] ✅ Base de datos eliminada, recreando...')
          // Reabrir (esto creará los stores en onupgradeneeded)
          const recreateRequest = indexedDB.open(DB_NAME, DB_VERSION)
          
          recreateRequest.onerror = () => {
            const error = recreateRequest.error || new Error('Error al recrear base de datos')
            console.error('[IndexedDB Shared] ❌ Error al recrear:', error)
            rejectOnce(error as Error)
          }
          
          recreateRequest.onsuccess = () => {
            if (!recreateRequest.result) {
              rejectOnce(new Error('Recreación exitosa pero sin resultado'))
              return
            }
            console.log('[IndexedDB Shared] ✅ Base de datos recreada con stores')
            resolveOnce(recreateRequest.result)
          }
          
          recreateRequest.onupgradeneeded = (event) => {
            console.log('[IndexedDB Shared] ⚠️ Creando stores en recreación...')
            const recreateDb = (event.target as IDBOpenDBRequest).result
            
            // Crear store de cuentas
            const store = recreateDb.createObjectStore(STORE_NAME, { keyPath: 'address' })
            store.createIndex('byType', 'type', { unique: false })
            store.createIndex('byCreatedAt', 'createdAt', { unique: false })
            store.createIndex('byName', 'meta.name', { unique: false })
            console.log(`[IndexedDB Shared] ObjectStore '${STORE_NAME}' creado`)
            
            // Crear store de WebAuthn
            const webauthnStore = recreateDb.createObjectStore(WEBAUTHN_STORE_NAME, { keyPath: 'id' })
            webauthnStore.createIndex('byCreatedAt', 'createdAt', { unique: false })
            console.log(`[IndexedDB Shared] ObjectStore '${WEBAUTHN_STORE_NAME}' creado`)
          }
        }
        
        deleteRequest.onerror = () => {
          const error = deleteRequest.error || new Error('Error al eliminar base de datos')
          console.error('[IndexedDB Shared] ❌ Error al eliminar:', error)
          rejectOnce(error as Error)
        }
        
        return // No continuar con el resolve original
      }
      
      resolveOnce(db)
    }

    req.onupgradeneeded = (event) => {
      console.log('[IndexedDB Shared] ⚠️ Ejecutando upgrade...')
      const db = (event.target as IDBOpenDBRequest).result
      const oldVersion = event.oldVersion || 0
      const newVersion = event.newVersion || DB_VERSION
      console.log(`[IndexedDB Shared] Migrando de versión ${oldVersion} a ${newVersion}`)

      const STORE_NAME = 'encrypted-accounts'
      const WEBAUTHN_STORE_NAME = 'webauthn-credentials'

      try {
        // Si es una instalación nueva (sin versión anterior)
        if (oldVersion === 0) {
          // Crear store de cuentas encriptadas
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'address' })
          store.createIndex('byType', 'type', { unique: false })
          store.createIndex('byCreatedAt', 'createdAt', { unique: false })
          store.createIndex('byName', 'meta.name', { unique: false })
          console.log(`[IndexedDB Shared] ObjectStore '${STORE_NAME}' creado con índices`)

          // Crear store de WebAuthn
          const webauthnStore = db.createObjectStore(WEBAUTHN_STORE_NAME, { keyPath: 'id' })
          webauthnStore.createIndex('byCreatedAt', 'createdAt', { unique: false })
          console.log(`[IndexedDB Shared] ObjectStore '${WEBAUTHN_STORE_NAME}' creado`)
        } else {
          const transaction = (event.target as IDBOpenDBRequest).transaction
          if (!transaction) {
            console.error('[IndexedDB Shared] No se pudo obtener la transacción de migración')
            return
          }

          // Migración de versión 1 a 2: Agregar índices
          if (oldVersion < 2) {
            if (db.objectStoreNames.contains(STORE_NAME)) {
              const store = transaction.objectStore(STORE_NAME)

              if (!store.indexNames.contains('byType')) {
                store.createIndex('byType', 'type', { unique: false })
                console.log('[IndexedDB Shared] Índice "byType" creado')
              }
              
              if (!store.indexNames.contains('byCreatedAt')) {
                store.createIndex('byCreatedAt', 'createdAt', { unique: false })
                console.log('[IndexedDB Shared] Índice "byCreatedAt" creado')
              }

              if (!store.indexNames.contains('byName')) {
                store.createIndex('byName', 'meta.name', { unique: false })
                console.log('[IndexedDB Shared] Índice "byName" creado')
              }
            }
          }

          // Migración de versión 2 a 3: Agregar store de WebAuthn
          if (oldVersion < 3) {
            if (!db.objectStoreNames.contains(WEBAUTHN_STORE_NAME)) {
              const webauthnStore = db.createObjectStore(WEBAUTHN_STORE_NAME, { keyPath: 'id' })
              webauthnStore.createIndex('byCreatedAt', 'createdAt', { unique: false })
              console.log(`[IndexedDB Shared] ObjectStore '${WEBAUTHN_STORE_NAME}' creado`)
            }
          }
        }
        console.log('[IndexedDB Shared] ✅ Migración completada exitosamente')
      } catch (error) {
        console.error('[IndexedDB Shared] ❌ Error durante la migración:', error)
        // No rechazar aquí, dejar que el upgrade continúe
      }
    }
    
    req.onblocked = () => {
      console.warn('[IndexedDB Shared] ⚠️ Base de datos bloqueada. Cierra otras pestañas que usen esta base de datos.')
      console.warn('[IndexedDB Shared] Esto puede causar que la conexión se quede colgada.')
    }
  })

  return openPromise
}

/**
 * Cierra la conexión a la base de datos
 */
export function closeSharedDB(): void {
  if (dbInstance) {
    dbInstance.close()
    dbInstance = null
    openPromise = null
    console.log('[IndexedDB Shared] Conexión cerrada')
  }
}

/**
 * Obtiene la instancia actual de la base de datos (sin abrir si no existe)
 */
export function getSharedDB(): IDBDatabase | null {
  return dbInstance
}

/**
 * Intenta eliminar la base de datos si está corrupta
 * Úsalo solo como último recurso
 */
export async function deleteDatabase(): Promise<void> {
  console.warn('[IndexedDB Shared] ⚠️ Eliminando base de datos (esto borrará todos los datos)...')
  
  // Cerrar conexión existente
  if (dbInstance) {
    dbInstance.close()
    dbInstance = null
  }
  openPromise = null
  
  return new Promise((resolve, reject) => {
    const deleteRequest = indexedDB.deleteDatabase(DB_NAME)
    
    deleteRequest.onsuccess = () => {
      console.log('[IndexedDB Shared] ✅ Base de datos eliminada exitosamente')
      resolve()
    }
    
    deleteRequest.onerror = () => {
      const error = deleteRequest.error || new Error('Error al eliminar la base de datos')
      console.error('[IndexedDB Shared] ❌ Error al eliminar:', error)
      reject(error)
    }
    
    deleteRequest.onblocked = () => {
      console.warn('[IndexedDB Shared] ⚠️ Eliminación bloqueada. Cierra otras pestañas.')
      // Esperar un poco y reintentar
      setTimeout(() => {
        deleteDatabase().then(resolve).catch(reject)
      }, 1000)
    }
  })
}

/**
 * Verifica el estado de IndexedDB
 */
export async function checkIndexedDBStatus(): Promise<{
  available: boolean
  databases: Array<{ name: string; version: number }>
  error?: string
}> {
  if (!('indexedDB' in window)) {
    return {
      available: false,
      databases: [],
      error: 'IndexedDB no está disponible en este navegador'
    }
  }
  
  try {
    const databases = await indexedDB.databases()
    return {
      available: true,
      databases: databases.map(db => ({
        name: db.name || '',
        version: db.version || 0
      }))
    }
  } catch (error) {
    return {
      available: true,
      databases: [],
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

