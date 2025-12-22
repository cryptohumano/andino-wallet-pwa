import { useState, useEffect, useCallback } from 'react'
import { DedotClient } from 'dedot'
import { WsProvider } from 'dedot'

// Endpoints de People Chain
const PEOPLE_CHAIN_ENDPOINTS = {
  polkadot: 'wss://polkadot-people-rpc.polkadot.io',
  kusama: 'wss://kusama-people-rpc.polkadot.io',
  paseo: 'wss://sys.ibp.network/people-paseo',
}

export interface IdentityInfo {
  display?: string
  legal?: string
  web?: string
  riot?: string
  email?: string
  twitter?: string
  additional?: Array<{ key: string; value: string }>
  judgements?: Array<{ index: number; judgement: string }>
  deposit?: bigint
}

export interface IdentityResult {
  identity: IdentityInfo | null
  isLoading: boolean
  error: string | null
  hasIdentity: boolean
}

/**
 * Hook para obtener información de identidad de una cuenta en People Chain
 */
export function usePeopleChainIdentity(
  address: string | null,
  network: 'polkadot' | 'kusama' | 'paseo' = 'polkadot'
): IdentityResult {
  const [identity, setIdentity] = useState<IdentityInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasIdentity, setHasIdentity] = useState(false)

  const fetchIdentity = useCallback(async () => {
    if (!address) {
      setIdentity(null)
      setHasIdentity(false)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const endpoint = PEOPLE_CHAIN_ENDPOINTS[network]
      const provider = new WsProvider(endpoint)
      await provider.connect()
      const client = await DedotClient.new(provider)

      try {
        // Query de identidad usando el pallet identity
        // Nota: La estructura exacta puede variar según la versión de People Chain
        const identityData = await client.query.identity.identityOf(address)

        if (identityData && identityData.value) {
          const info = identityData.value.info || {}
          const judgements = identityData.value.judgements || []
          const deposit = identityData.value.deposit ? BigInt(identityData.value.deposit.toString()) : undefined

          const identityInfo: IdentityInfo = {
            display: info.display?.value,
            legal: info.legal?.value,
            web: info.web?.value,
            riot: info.riot?.value,
            email: info.email?.value,
            twitter: info.twitter?.value,
            additional: info.additional?.map((item: any) => ({
              key: item[0]?.value || '',
              value: item[1]?.value || '',
            })),
            judgements: judgements.map((j: any, index: number) => ({
              index,
              judgement: j[1]?.toString() || 'Unknown',
            })),
            deposit,
          }

          setIdentity(identityInfo)
          setHasIdentity(true)
        } else {
          setIdentity(null)
          setHasIdentity(false)
        }
      } catch (err: any) {
        // Si el pallet no existe o hay un error, asumimos que no hay identidad
        console.warn(`Error querying identity from People Chain (${network}):`, err)
        setIdentity(null)
        setHasIdentity(false)
      } finally {
        await client.disconnect()
      }
    } catch (err: any) {
      setError(err.message || 'Error al conectar con People Chain')
      console.error('Error fetching identity:', err)
      setIdentity(null)
      setHasIdentity(false)
    } finally {
      setIsLoading(false)
    }
  }, [address, network])

  useEffect(() => {
    fetchIdentity()
  }, [fetchIdentity])

  return {
    identity,
    isLoading,
    error,
    hasIdentity,
  }
}

/**
 * Hook para obtener identidad de múltiples redes de People Chain
 */
export function useMultiPeopleChainIdentity(address: string | null) {
  const [identities, setIdentities] = useState<Record<string, IdentityInfo | null>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!address) {
      setIdentities({})
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    const fetchAll = async () => {
      const results: Record<string, IdentityInfo | null> = {}

      for (const [network, endpoint] of Object.entries(PEOPLE_CHAIN_ENDPOINTS)) {
        try {
          const provider = new WsProvider(endpoint)
          await provider.connect()
          const client = await DedotClient.new(provider)

          try {
            const identityData = await client.query.identity.identityOf(address)

            if (identityData && identityData.value) {
              const info = identityData.value.info || {}
              results[network] = {
                display: info.display?.value,
                legal: info.legal?.value,
                web: info.web?.value,
                riot: info.riot?.value,
                email: info.email?.value,
                twitter: info.twitter?.value,
                additional: info.additional?.map((item: any) => ({
                  key: item[0]?.value || '',
                  value: item[1]?.value || '',
                })),
                judgements: identityData.value.judgements?.map((j: any, index: number) => ({
                  index,
                  judgement: j[1]?.toString() || 'Unknown',
                })),
                deposit: identityData.value.deposit ? BigInt(identityData.value.deposit.toString()) : undefined,
              }
            } else {
              results[network] = null
            }
          } catch (err) {
            console.warn(`No identity found on ${network} People Chain`)
            results[network] = null
          } finally {
            await client.disconnect()
          }
        } catch (err: any) {
          console.error(`Error fetching identity from ${network}:`, err)
          results[network] = null
        }
      }

      setIdentities(results)
      setIsLoading(false)
    }

    fetchAll()
  }, [address])

  return { identities, isLoading, error }
}

