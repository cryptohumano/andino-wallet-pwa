import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Wallet, Send, QrCode, ArrowRight, Copy, Check, Download, Key } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useKeyringContext } from '@/contexts/KeyringContext'
import { useState } from 'react'
import Identicon from '@polkadot/react-identicon'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export default function Home() {
  const { accounts } = useKeyringContext()
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)

  const handleCopyAddress = async (address: string) => {
    await navigator.clipboard.writeText(address)
    setCopiedAddress(address)
    setTimeout(() => setCopiedAddress(null), 2000)
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-6)}`
  }
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Aura Wallet</h1>
        <p className="text-muted-foreground mt-2">
          Tu wallet criptográfica con capacidades avanzadas
        </p>
      </div>

      {/* Balance Total */}
      <Card>
        <CardHeader>
          <CardTitle>Balance Total</CardTitle>
          <CardDescription>Suma de todas tus cuentas activas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">0.00 DOT</div>
          <p className="text-sm text-muted-foreground mt-2">≈ $0.00 USD</p>
        </CardContent>
      </Card>

      {/* Acciones Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Enviar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Envía tokens a otra dirección
            </p>
            <Button asChild className="w-full">
              <Link to="/send">
                Enviar Fondos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Recibir
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Muestra tu dirección para recibir fondos
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link to="/receive">
                Recibir Fondos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Cuentas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Gestiona tus cuentas y direcciones
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link to="/accounts">
                Ver Cuentas
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Cuentas Activas */}
      <Card>
        <CardHeader>
          <CardTitle>Cuentas Activas</CardTitle>
          <CardDescription>
            {accounts.length > 0 
              ? `${accounts.length} cuenta${accounts.length > 1 ? 's' : ''} configurada${accounts.length > 1 ? 's' : ''}`
              : 'Gestiona tus cuentas del keyring'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {accounts.length === 0 ? (
            <div className="text-center py-8 space-y-4">
              <div className="text-muted-foreground">
                <p className="mb-4">No hay cuentas configuradas aún</p>
                <p className="text-sm mb-6">Puedes crear una nueva cuenta o importar una existente</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild>
                  <Link to="/accounts/create">
                    <Key className="mr-2 h-4 w-4" />
                    Crear Nueva Cuenta
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/accounts/import">
                    <Download className="mr-2 h-4 w-4" />
                    Importar Cuenta
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {accounts.map((account) => (
                <div
                  key={account.address}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <Identicon
                        value={account.address}
                        size={40}
                        theme="polkadot"
                      />
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold truncate">
                          {account.meta.name || 'Sin nombre'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="text-xs text-muted-foreground font-mono">
                          {formatAddress(account.address)}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleCopyAddress(account.address)}
                        >
                          {copiedAddress === account.address ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/accounts/${account.address}`}>Ver</Link>
                  </Button>
                </div>
              ))}
              <Button asChild variant="outline" className="w-full mt-4">
                <Link to="/accounts">
                  Ver todas las cuentas
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transacciones Recientes */}
      <Card>
        <CardHeader>
          <CardTitle>Transacciones Recientes</CardTitle>
          <CardDescription>Últimas transacciones realizadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No hay transacciones aún</p>
            <Button asChild variant="link" className="mt-4">
              <Link to="/transactions">Ver todas las transacciones</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

