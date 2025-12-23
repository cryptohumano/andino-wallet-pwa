/**
 * Componente para seleccionar y aplicar tipo de firma
 */

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useKeyringContext } from '@/contexts/KeyringContext'
import SignatureCanvasComponent from './SignatureCanvas'
import { FileKey, PenTool, Shield } from 'lucide-react'
import type { Document } from '@/types/documents'
import { signDocumentWithSubstrate } from '@/services/signatures/SubstrateSigner'
import { addAutographicSignature } from '@/services/signatures/AutographicSigner'
import { toast } from 'sonner'
import Identicon from '@polkadot/react-identicon'

export interface SignatureSelectorProps {
  document: Document
  onSigned: (updatedDocument: Document) => void
  onCancel: () => void
}

export default function SignatureSelector({
  document,
  onSigned,
  onCancel,
}: SignatureSelectorProps) {
  const { accounts, getAccount } = useKeyringContext()
  // Inicializar con la cuenta del autor si existe, o la primera cuenta disponible
  const defaultAccount = document.relatedAccount || accounts[0]?.address || ''
  const [selectedAccount, setSelectedAccount] = useState<string>(defaultAccount)
  const [signatureImage, setSignatureImage] = useState<string | null>(null)
  const [isSigning, setIsSigning] = useState(false)
  const [activeTab, setActiveTab] = useState<'substrate' | 'autographic'>('substrate')

  const handleSubstrateSign = async () => {
    if (!selectedAccount) {
      toast.error('Por favor selecciona una cuenta')
      return
    }

    try {
      setIsSigning(true)

      const account = getAccount(selectedAccount)
      if (!account) {
        throw new Error('Cuenta no encontrada')
      }

      const updatedDocument = await signDocumentWithSubstrate({
        document,
        pair: account.pair,
      })

      toast.success('Documento firmado exitosamente')
      onSigned(updatedDocument)
    } catch (error) {
      console.error('[Signature Selector] Error al firmar:', error)
      toast.error(
        error instanceof Error ? error.message : 'Error al firmar el documento'
      )
    } finally {
      setIsSigning(false)
    }
  }

  const handleAutographicSign = async () => {
    if (!signatureImage) {
      toast.error('Por favor captura tu firma')
      return
    }

    try {
      setIsSigning(true)

      // Por defecto, colocar la firma en la última página, abajo a la derecha
      const updatedDocument = await addAutographicSignature({
        document,
        signatureImage,
        position: {
          page: 0, // Primera página (ajustar según necesidad)
          x: 120, // mm desde la izquierda
          y: 20, // mm desde abajo
          width: 60,
          height: 30,
        },
        captureGPS: false, // Opcional: capturar GPS
      })

      toast.success('Firma autográfica agregada exitosamente')
      onSigned(updatedDocument)
    } catch (error) {
      console.error('[Signature Selector] Error al agregar firma autográfica:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Error al agregar firma autográfica'
      )
    } finally {
      setIsSigning(false)
    }
  }

  const handleSignatureCapture = (image: string) => {
    setSignatureImage(image)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Firmar Documento</CardTitle>
        <CardDescription>
          Selecciona el tipo de firma que deseas aplicar
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="substrate" className="flex items-center gap-2">
              <FileKey className="h-4 w-4" />
              Digital (Substrate)
            </TabsTrigger>
            <TabsTrigger value="autographic" className="flex items-center gap-2">
              <PenTool className="h-4 w-4" />
              Autográfica
            </TabsTrigger>
          </TabsList>

          <TabsContent value="substrate" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="account-select">Cuenta para firmar</Label>
              <Select
                value={selectedAccount}
                onValueChange={setSelectedAccount}
              >
                <SelectTrigger id="account-select">
                  <SelectValue placeholder="Selecciona una cuenta">
                    {selectedAccount && (
                      <div className="flex items-center gap-2">
                        <Identicon
                          value={selectedAccount}
                          size={16}
                          theme="polkadot"
                        />
                        <span>
                          {accounts.find(a => a.address === selectedAccount)?.meta?.name || 
                           `${selectedAccount.slice(0, 8)}...${selectedAccount.slice(-6)}`}
                        </span>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.address} value={account.address}>
                      <div className="flex items-center gap-2">
                        <Identicon
                          value={account.address}
                          size={16}
                          theme="polkadot"
                        />
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {account.meta?.name || 'Sin nombre'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {account.address.slice(0, 8)}...{account.address.slice(-6)}
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubstrateSign}
                disabled={!selectedAccount || isSigning}
                className="flex-1"
              >
                <Shield className="mr-2 h-4 w-4" />
                {isSigning ? 'Firmando...' : 'Firmar Documento'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="autographic" className="space-y-4 mt-4">
            {signatureImage ? (
              <div className="space-y-4">
                <div className="border rounded-lg p-4 bg-white">
                  <img
                    src={signatureImage}
                    alt="Firma capturada"
                    className="max-w-full h-auto"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setSignatureImage(null)}
                    className="flex-1"
                  >
                    Capturar de nuevo
                  </Button>
                  <Button
                    variant="outline"
                    onClick={onCancel}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleAutographicSign}
                    disabled={isSigning}
                    className="flex-1"
                  >
                    {isSigning ? 'Agregando...' : 'Agregar Firma'}
                  </Button>
                </div>
              </div>
            ) : (
              <SignatureCanvasComponent
                onSave={handleSignatureCapture}
                onCancel={onCancel}
              />
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

