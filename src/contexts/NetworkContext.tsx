import { createContext, useContext, useState, ReactNode, useCallback } from 'react'
import { ChainInfo, useDedotClient } from '@/hooks/useDedotClient'
import { DedotClient } from 'dedot'

interface NetworkContextType {
  selectedChain: ChainInfo | null
  setSelectedChain: (chain: ChainInfo | null) => void
  client: DedotClient | null
  isConnecting: boolean
  error: string | null
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined)

export function NetworkProvider({ children }: { children: ReactNode }) {
  const [selectedChain, setSelectedChain] = useState<ChainInfo | null>(null)
  const { client, isConnecting, error } = useDedotClient(selectedChain?.endpoint || null)

  return (
    <NetworkContext.Provider
      value={{
        selectedChain,
        setSelectedChain,
        client,
        isConnecting,
        error: error || null,
      }}
    >
      {children}
    </NetworkContext.Provider>
  )
}

export function useNetwork() {
  const context = useContext(NetworkContext)
  if (context === undefined) {
    throw new Error('useNetwork must be used within a NetworkProvider')
  }
  return context
}

