import { useState } from 'react'
import { DEFAULT_CHAINS, type ChainInfo } from '@/hooks/useDedotClient'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Wifi, WifiOff, Loader2 } from 'lucide-react'

interface NetworkSwitcherProps {
  selectedChain: ChainInfo | null
  onSelectChain: (chain: ChainInfo) => void
  isConnecting: boolean
}

export function NetworkSwitcher({ selectedChain, onSelectChain, isConnecting }: NetworkSwitcherProps) {
  return (
    <div className="flex items-center gap-2">
      {isConnecting ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      ) : selectedChain ? (
        <Wifi className="h-4 w-4 text-green-500" />
      ) : (
        <WifiOff className="h-4 w-4 text-muted-foreground" />
      )}
      <Select
        value={selectedChain?.endpoint || ''}
        onValueChange={(endpoint) => {
          const chain = DEFAULT_CHAINS.find(c => c.endpoint === endpoint)
          if (chain) {
            onSelectChain(chain)
          }
        }}
        disabled={isConnecting}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Seleccionar red">
            {selectedChain ? selectedChain.name : 'Seleccionar red'}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {DEFAULT_CHAINS.map((chain) => (
            <SelectItem key={chain.endpoint} value={chain.endpoint}>
              <div className="flex items-center justify-between w-full">
                <span>{chain.name}</span>
                {selectedChain?.endpoint === chain.endpoint && (
                  <Badge variant="secondary" className="ml-2">Activa</Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

