import { useEffect, useState } from 'react'
import { DedotClient, WsProvider } from 'dedot'

export interface ChainInfo {
  name: string
  endpoint: string
  description?: string
}

export const DEFAULT_CHAINS: ChainInfo[] = [
  {
    name: 'Polkadot',
    endpoint: 'wss://rpc.polkadot.io',
    description: 'Red principal de Polkadot'
  },
  {
    name: 'Kusama',
    endpoint: 'wss://kusama-rpc.polkadot.io',
    description: 'Red canary de Polkadot'
  },
  {
    name: 'Paseo Relay Chain',
    endpoint: 'wss://rpc.ibp.network/paseo',
    description: 'Paseo Relay Chain - Testnet de Polkadot'
  },
  {
    name: 'Asset Hub (Paseo)',
    endpoint: 'wss://sys.ibp.network/asset-hub-paseo',
    description: 'Asset Hub de Paseo - Gestión de activos y NFTs'
  },
  {
    name: 'Bridge Hub (Paseo)',
    endpoint: 'wss://sys.ibp.network/bridgehub-paseo',
    description: 'Bridge Hub de Paseo - Puentes entre cadenas'
  },
  {
    name: 'Coretime (Paseo)',
    endpoint: 'wss://sys.ibp.network/coretime-paseo',
    description: 'Coretime Chain de Paseo - Gestión de coretime'
  },
  {
    name: 'People (Paseo)',
    endpoint: 'wss://sys.ibp.network/people-paseo',
    description: 'People Chain de Paseo - Sistema de identidad'
  },
  {
    name: 'Collectives (Paseo)',
    endpoint: 'wss://collectives-paseo.dotters.network',
    description: 'Collectives Chain de Paseo - Gobernanza y colectivos'
  },
  {
    name: 'Asset Hub (Polkadot)',
    endpoint: 'wss://polkadot-asset-hub-rpc.polkadot.io',
    description: 'Asset Hub de Polkadot - Gestión de activos y NFTs'
  },
  {
    name: 'Asset Hub (Kusama)',
    endpoint: 'wss://kusama-asset-hub-rpc.polkadot.io',
    description: 'Asset Hub de Kusama - Gestión de activos y NFTs'
  },
  {
    name: 'People Chain (Polkadot)',
    endpoint: 'wss://polkadot-people-rpc.polkadot.io',
    description: 'People Chain de Polkadot - Sistema de identidad'
  },
  {
    name: 'People Chain (Kusama)',
    endpoint: 'wss://kusama-people-rpc.polkadot.io',
    description: 'People Chain de Kusama - Sistema de identidad'
  }
]

export function useDedotClient(endpoint: string | null) {
  const [client, setClient] = useState<DedotClient | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!endpoint) {
      setClient(null)
      return
    }

    setIsConnecting(true)
    setError(null)

    const provider = new WsProvider(endpoint)
    let newClient: DedotClient | null = null

    // Conectar el provider primero, luego crear el cliente
    provider.connect()
      .then(() => {
        return DedotClient.new(provider)
      })
      .then((client) => {
        newClient = client
        setClient(client)
        setIsConnecting(false)
      })
      .catch((err) => {
        setError(err.message || 'Error al conectar')
        setIsConnecting(false)
        setClient(null)
      })

    return () => {
      if (newClient) {
        newClient.disconnect().catch(() => {})
      }
    }
  }, [endpoint])

  return { client, isConnecting, error }
}

