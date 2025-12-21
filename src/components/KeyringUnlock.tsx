import { useState } from 'react'
import { useKeyringContext } from '@/contexts/KeyringContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Lock, Unlock, AlertCircle } from 'lucide-react'

export function KeyringUnlock() {
  const { isUnlocked, hasStoredAccounts, unlock, lock, isReady } = useKeyringContext()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Si el keyring no está listo, mostrar un mensaje
  if (!isReady) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Estado del Keyring
          </CardTitle>
          <CardDescription>
            Inicializando keyring...
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const handleUnlock = async () => {
    if (!password.trim()) {
      setError('Por favor ingresa una contraseña')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const success = await unlock(password)
      if (!success) {
        setError('Contraseña incorrecta')
        setPassword('')
      } else {
        setPassword('')
      }
    } catch (err: any) {
      setError(err.message || 'Error al desbloquear el keyring')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLock = () => {
    lock()
    setPassword('')
    setError(null)
  }

  if (isUnlocked) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Unlock className="h-5 w-5 text-green-600" />
            Keyring Desbloqueado
          </CardTitle>
          <CardDescription>
            Tus cuentas están cargadas y disponibles para operaciones criptográficas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleLock} variant="outline" className="w-full">
            <Lock className="h-4 w-4 mr-2" />
            Bloquear Keyring
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Al bloquear, las claves privadas se eliminarán de la memoria
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!hasStoredAccounts) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Estado del Keyring
          </CardTitle>
          <CardDescription>
            No hay cuentas almacenadas. Desbloquea el keyring para crear tu primera cuenta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Contraseña (cualquiera, para desbloquear y crear tu primera cuenta)"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError(null)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleUnlock()
                }
              }}
              disabled={isLoading}
            />
            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
          </div>

          <Button 
            onClick={handleUnlock} 
            disabled={isLoading || !password.trim()} 
            className="w-full"
          >
            {isLoading ? 'Desbloqueando...' : 'Desbloquear para Crear Primera Cuenta'}
          </Button>

          <div className="p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground">
              <strong>Nota:</strong> Como no hay cuentas almacenadas, puedes usar cualquier contraseña para desbloquear.
              Esta contraseña se usará para encriptar tu primera cuenta cuando la crees.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-yellow-200 dark:border-yellow-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Desbloquear Keyring
        </CardTitle>
        <CardDescription>
          Ingresa tu contraseña para cargar tus cuentas almacenadas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setError(null)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleUnlock()
              }
            }}
            disabled={isLoading}
          />
          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
        </div>

        <Button 
          onClick={handleUnlock} 
          disabled={isLoading || !password.trim()} 
          className="w-full"
        >
          {isLoading ? 'Desbloqueando...' : 'Desbloquear'}
        </Button>

        <div className="p-3 bg-muted rounded-lg">
          <p className="text-xs text-muted-foreground">
            <strong>Seguridad:</strong> Las claves privadas están encriptadas con tu contraseña 
            y almacenadas localmente en IndexedDB. Solo tú puedes desbloquearlas.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

