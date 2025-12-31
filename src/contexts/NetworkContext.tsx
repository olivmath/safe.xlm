import { createContext, useContext, useState, ReactNode } from 'react'
import { StellarNetwork, NetworkConfig, NETWORKS, DEFAULT_NETWORK } from '../config/networks'

interface NetworkContextType {
  network: StellarNetwork
  config: NetworkConfig
  setNetwork: (network: StellarNetwork) => void
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined)

export function NetworkProvider({ children }: { children: ReactNode }) {
  const [network, setNetwork] = useState<StellarNetwork>(() => {
    // Try to get from localStorage
    const saved = localStorage.getItem('stellar-network')
    if (saved && saved in NETWORKS) {
      return saved as StellarNetwork
    }
    return DEFAULT_NETWORK
  })

  const handleSetNetwork = (newNetwork: StellarNetwork) => {
    setNetwork(newNetwork)
    localStorage.setItem('stellar-network', newNetwork)
  }

  return (
    <NetworkContext.Provider
      value={{
        network,
        config: NETWORKS[network],
        setNetwork: handleSetNetwork
      }}
    >
      {children}
    </NetworkContext.Provider>
  )
}

export function useNetwork() {
  const context = useContext(NetworkContext)
  if (!context) {
    throw new Error('useNetwork must be used within NetworkProvider')
  }
  return context
}
