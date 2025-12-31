// Stellar Network Configuration
// Replaces Ethereum networks (Sepolia, Anvil) with Stellar networks

export type StellarNetwork = 'testnet' | 'futurenet' | 'localnet'

export interface NetworkConfig {
  name: string
  networkPassphrase: string
  horizonUrl: string
  sorobanRpcUrl: string
  explorerUrl: string
  color: string
  isTestnet: boolean
}

export const NETWORKS: Record<StellarNetwork, NetworkConfig> = {
  testnet: {
    name: 'Testnet',
    networkPassphrase: 'Test SDF Network ; September 2015',
    horizonUrl: 'https://horizon-testnet.stellar.org',
    sorobanRpcUrl: 'https://soroban-testnet.stellar.org',
    explorerUrl: 'https://stellar.expert/explorer/testnet',
    color: 'bg-purple-500',
    isTestnet: true,
  },
  futurenet: {
    name: 'Futurenet',
    networkPassphrase: 'Test SDF Future Network ; October 2022',
    horizonUrl: 'https://horizon-futurenet.stellar.org',
    sorobanRpcUrl: 'https://rpc-futurenet.stellar.org',
    explorerUrl: 'https://stellar.expert/explorer/futurenet',
    color: 'bg-orange-500',
    isTestnet: true,
  },
  localnet: {
    name: 'Localnet',
    networkPassphrase: 'Standalone Network ; February 2017',
    horizonUrl: 'http://localhost:8000',
    sorobanRpcUrl: 'http://localhost:8000/soroban/rpc',
    explorerUrl: 'http://localhost:8000',
    color: 'bg-green-500',
    isTestnet: true,
  },
}

export const DEFAULT_NETWORK: StellarNetwork = 'testnet'

// Helper to get network config
export function getNetworkConfig(network: StellarNetwork): NetworkConfig {
  return NETWORKS[network]
}

// Helper to format XLM balance (7 decimal places)
export function formatXLM(stroops: string | bigint): string {
  const value = typeof stroops === 'string' ? BigInt(stroops) : stroops
  const xlm = Number(value) / 10_000_000
  return xlm.toFixed(4)
}

// Helper to convert XLM to stroops
export function toStroops(xlm: number): bigint {
  return BigInt(Math.floor(xlm * 10_000_000))
}
