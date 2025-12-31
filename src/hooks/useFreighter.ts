import { useState, useEffect, useCallback } from 'react'
import {
  isConnected as freighterIsConnected,
  isAllowed,
  setAllowed,
  getPublicKey,
  getNetwork,
} from '@stellar/freighter-api'
import { StellarNetwork } from '../config/networks'

export interface FreighterState {
  isInstalled: boolean
  isConnected: boolean
  isAllowed: boolean
  publicKey: string | null
  network: StellarNetwork | null
  isLoading: boolean
  error: string | null
}

export interface UseFreighterReturn extends FreighterState {
  connect: () => Promise<void>
  disconnect: () => void
  checkConnection: () => Promise<void>
}

export function useFreighter(): UseFreighterReturn {
  const [state, setState] = useState<FreighterState>({
    isInstalled: false,
    isConnected: false,
    isAllowed: false,
    publicKey: null,
    network: null,
    isLoading: true,
    error: null,
  })

  // Map Freighter network to our network type
  const mapNetwork = (freighterNetwork: string): StellarNetwork | null => {
    const networkLower = freighterNetwork.toLowerCase()
    if (networkLower.includes('testnet') || networkLower.includes('test')) return 'testnet'
    if (networkLower.includes('futurenet') || networkLower.includes('future')) return 'futurenet'
    if (networkLower.includes('standalone') || networkLower.includes('local')) return 'localnet'
    return 'testnet' // Default to testnet
  }

  const checkConnection = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      // Check if Freighter is installed
      const connected = await freighterIsConnected()

      if (!connected) {
        setState({
          isInstalled: false,
          isConnected: false,
          isAllowed: false,
          publicKey: null,
          network: null,
          isLoading: false,
          error: null,
        })
        return
      }

      // Check if user has allowed connection
      const allowed = await isAllowed()

      if (!allowed) {
        setState({
          isInstalled: true,
          isConnected: false,
          isAllowed: false,
          publicKey: null,
          network: null,
          isLoading: false,
          error: null,
        })
        return
      }

      // Get public key and network
      const publicKey = await getPublicKey()
      const networkString = await getNetwork()

      setState({
        isInstalled: true,
        isConnected: true,
        isAllowed: true,
        publicKey,
        network: mapNetwork(typeof networkString === 'string' ? networkString : (networkString as { network: string }).network || 'testnet'),
        isLoading: false,
        error: null,
      })
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to check Freighter connection',
      }))
    }
  }, [])

  const connect = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      // Check if Freighter is installed
      const connected = await freighterIsConnected()

      if (!connected) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Freighter wallet is not installed. Please install it from https://freighter.app',
        }))
        return
      }

      // Request permission
      await setAllowed()

      // Get public key and network
      const publicKey = await getPublicKey()
      const networkString = await getNetwork()

      setState({
        isInstalled: true,
        isConnected: true,
        isAllowed: true,
        publicKey,
        network: mapNetwork(typeof networkString === 'string' ? networkString : (networkString as { network: string }).network || 'testnet'),
        isLoading: false,
        error: null,
      })
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to connect to Freighter',
      }))
    }
  }, [])

  const disconnect = useCallback(() => {
    setState({
      isInstalled: true, // Still installed, just disconnected
      isConnected: false,
      isAllowed: false,
      publicKey: null,
      network: null,
      isLoading: false,
      error: null,
    })
  }, [])

  // Check connection on mount
  useEffect(() => {
    checkConnection()
  }, [checkConnection])

  // Listen for account changes (Freighter doesn't have native events, so we poll)
  useEffect(() => {
    if (!state.isConnected) return

    const interval = setInterval(async () => {
      try {
        const allowed = await isAllowed()
        if (!allowed && state.isConnected) {
          disconnect()
        } else if (allowed) {
          const publicKey = await getPublicKey()
          if (publicKey !== state.publicKey) {
            setState(prev => ({ ...prev, publicKey }))
          }
        }
      } catch {
        // Ignore errors during polling
      }
    }, 5000) // Check every 5 seconds

    return () => clearInterval(interval)
  }, [state.isConnected, state.publicKey, disconnect])

  return {
    ...state,
    connect,
    disconnect,
    checkConnection,
  }
}
