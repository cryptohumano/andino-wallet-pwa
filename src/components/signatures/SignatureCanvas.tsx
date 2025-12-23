/**
 * Componente para capturar firma autográfica usando canvas
 */

import { useRef, useState, useCallback } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RotateCcw, Check, X } from 'lucide-react'

export interface SignatureCanvasProps {
  onSave: (signatureImage: string) => void
  onCancel: () => void
  width?: number
  height?: number
}

export default function SignatureCanvasComponent({
  onSave,
  onCancel,
  width,
  height,
}: SignatureCanvasProps) {
  // Usar valores responsivos por defecto
  const canvasWidth = width || (typeof window !== 'undefined' && window.innerWidth < 640 ? 300 : 400)
  const canvasHeight = height || 200
  const signatureRef = useRef<SignatureCanvas>(null)
  const [isEmpty, setIsEmpty] = useState(true)

  const handleClear = useCallback(() => {
    if (signatureRef.current) {
      signatureRef.current.clear()
      setIsEmpty(true)
    }
  }, [])

  const handleEnd = useCallback(() => {
    if (signatureRef.current && !signatureRef.current.isEmpty()) {
      setIsEmpty(false)
    }
  }, [])

  const handleSave = useCallback(() => {
    if (signatureRef.current && !signatureRef.current.isEmpty()) {
      const signatureImage = signatureRef.current.toDataURL('image/png')
      onSave(signatureImage)
    }
  }, [onSave])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Firma Autográfica</CardTitle>
        <CardDescription>
          Dibuja tu firma en el área de abajo usando el mouse o el dedo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border rounded-lg overflow-hidden bg-white w-full">
          <div className="w-full relative" style={{ paddingBottom: '50%' }}>
            <div className="absolute inset-0">
              <SignatureCanvas
                ref={signatureRef}
                canvasProps={{
                  width: canvasWidth,
                  height: canvasHeight,
                  className: 'signature-canvas',
                  style: { 
                    touchAction: 'none',
                    width: '100%',
                    height: '100%',
                  },
                }}
                onEnd={handleEnd}
                backgroundColor="#ffffff"
                penColor="#000000"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 justify-between">
          <Button
            variant="outline"
            onClick={handleClear}
            disabled={isEmpty}
            className="flex-1 sm:flex-initial"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Limpiar
          </Button>

          <div className="flex gap-2 flex-1 sm:flex-initial">
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1 sm:flex-initial"
            >
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={isEmpty}
              className="flex-1 sm:flex-initial"
            >
              <Check className="mr-2 h-4 w-4" />
              Guardar Firma
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

