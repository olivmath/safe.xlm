import { useState, useCallback, useEffect } from 'react'

// Mock Transaction Types for Soroban
export type TransactionType = 'xlm' | 'token' | 'custom'

export interface MockTransaction {
  id: number
  txType: TransactionType
  to: string
  amount: string // In stroops for XLM, raw amount for tokens
  tokenAddress?: string
  data?: string
  executed: boolean
  confirmations: string[] // List of public keys that confirmed
}

export interface MockMultiSigWallet {
  contractId: string
  owners: string[]
  required: number
  transactions: MockTransaction[]
  balance: string // In stroops
}

// LocalStorage keys
const WALLETS_STORAGE_KEY = 'multisig-wallets'

// Helper to load wallets from localStorage
function loadWalletsFromStorage(): MockMultiSigWallet[] {
  try {
    const stored = localStorage.getItem(WALLETS_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error('Failed to load wallets from storage:', e)
  }
  return []
}

// Helper to save wallets to localStorage
function saveWalletsToStorage(wallets: MockMultiSigWallet[]) {
  try {
    localStorage.setItem(WALLETS_STORAGE_KEY, JSON.stringify(wallets))
  } catch (e) {
    console.error('Failed to save wallets to storage:', e)
  }
}

// Generate a mock Stellar contract ID
function generateContractId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  let result = 'C'
  for (let i = 0; i < 55; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Hook to get user's multisig wallets
export function useMockMultiSigFactory(userPublicKey: string | null) {
  const [wallets, setWallets] = useState<MockMultiSigWallet[]>(() => loadWalletsFromStorage())
  const [isCreating, setIsCreating] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Filter wallets where user is an owner (or show all if no user connected)
  const userMultiSigs = userPublicKey
    ? wallets.filter(w => w.owners.includes(userPublicKey)).map(w => w.contractId)
    : wallets.map(w => w.contractId)

  const createMultiSig = useCallback(async (owners: string[], required: number) => {
    setIsCreating(true)
    setIsSuccess(false)

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Create mock wallet
    const newWallet: MockMultiSigWallet = {
      contractId: generateContractId(),
      owners,
      required,
      transactions: [],
      balance: '0',
    }

    const updatedWallets = [...wallets, newWallet]
    setWallets(updatedWallets)
    saveWalletsToStorage(updatedWallets)

    setIsCreating(false)
    setIsSuccess(true)

    // Reset success after a short delay
    setTimeout(() => setIsSuccess(false), 100)
  }, [wallets])

  const refetchUserMultiSigs = useCallback(() => {
    const loaded = loadWalletsFromStorage()
    setWallets(loaded)
  }, [])

  return {
    userMultiSigs,
    wallets: userPublicKey
      ? wallets.filter(w => w.owners.includes(userPublicKey))
      : wallets,
    allWallets: wallets,
    createMultiSig,
    isCreating,
    isSuccess,
    refetchUserMultiSigs,
  }
}

// Hook to interact with a specific multisig wallet
export function useMockMultiSig(contractId: string | undefined) {
  const [wallets, setWallets] = useState<MockMultiSigWallet[]>(() => loadWalletsFromStorage())
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reload wallets when contractId changes
  useEffect(() => {
    setWallets(loadWalletsFromStorage())
  }, [contractId])

  // Find the wallet
  const wallet = wallets.find(w => w.contractId === contractId)

  const owners = wallet?.owners ?? []
  const required = wallet?.required ?? 0
  const txCount = wallet?.transactions.length ?? 0
  const transactions = wallet?.transactions ?? []
  const balance = wallet?.balance ?? '0'

  const updateWallet = useCallback((updatedWallet: MockMultiSigWallet) => {
    const updatedWallets = wallets.map(w =>
      w.contractId === updatedWallet.contractId ? updatedWallet : w
    )
    setWallets(updatedWallets)
    saveWalletsToStorage(updatedWallets)
  }, [wallets])

  const submitXLM = useCallback(async (to: string, amount: string) => {
    if (!wallet) return
    setIsSubmitting(true)

    await new Promise(resolve => setTimeout(resolve, 1500))

    const newTx: MockTransaction = {
      id: wallet.transactions.length,
      txType: 'xlm',
      to,
      amount,
      executed: false,
      confirmations: [],
    }

    updateWallet({
      ...wallet,
      transactions: [...wallet.transactions, newTx],
    })

    setIsSubmitting(false)
  }, [wallet, updateWallet])

  const submitToken = useCallback(async (tokenAddress: string, to: string, amount: string) => {
    if (!wallet) return
    setIsSubmitting(true)

    await new Promise(resolve => setTimeout(resolve, 1500))

    const newTx: MockTransaction = {
      id: wallet.transactions.length,
      txType: 'token',
      to,
      amount,
      tokenAddress,
      executed: false,
      confirmations: [],
    }

    updateWallet({
      ...wallet,
      transactions: [...wallet.transactions, newTx],
    })

    setIsSubmitting(false)
  }, [wallet, updateWallet])

  const submitCustom = useCallback(async (to: string, data: string) => {
    if (!wallet) return
    setIsSubmitting(true)

    await new Promise(resolve => setTimeout(resolve, 1500))

    const newTx: MockTransaction = {
      id: wallet.transactions.length,
      txType: 'custom',
      to,
      amount: '0',
      data,
      executed: false,
      confirmations: [],
    }

    updateWallet({
      ...wallet,
      transactions: [...wallet.transactions, newTx],
    })

    setIsSubmitting(false)
  }, [wallet, updateWallet])

  const confirmTransaction = useCallback(async (txId: number, signerPublicKey: string) => {
    if (!wallet) return

    await new Promise(resolve => setTimeout(resolve, 1000))

    const updatedTxs = wallet.transactions.map(tx => {
      if (tx.id === txId && !tx.confirmations.includes(signerPublicKey)) {
        return {
          ...tx,
          confirmations: [...tx.confirmations, signerPublicKey],
        }
      }
      return tx
    })

    updateWallet({
      ...wallet,
      transactions: updatedTxs,
    })
  }, [wallet, updateWallet])

  const executeTransaction = useCallback(async (txId: number) => {
    if (!wallet) return

    await new Promise(resolve => setTimeout(resolve, 1000))

    const updatedTxs = wallet.transactions.map(tx => {
      if (tx.id === txId) {
        return { ...tx, executed: true }
      }
      return tx
    })

    updateWallet({
      ...wallet,
      transactions: updatedTxs,
    })
  }, [wallet, updateWallet])

  return {
    owners,
    required,
    txCount,
    transactions,
    balance,
    submitXLM,
    submitToken,
    submitCustom,
    confirmTransaction,
    executeTransaction,
    isSubmitting,
  }
}

// Hook for global stats - FIXED VALUES (no RPC connection)
export function useMockGlobalStats() {
  return {
    activeWallets: 157,
    uniqueOwners: 32,
    totalTransactions: 489,
  }
}
