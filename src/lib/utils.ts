import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format Stellar address for display
export function formatStellarAddress(address: string, length: 'short' | 'medium' | 'long' = 'medium'): string {
  if (!address) return ''

  switch (length) {
    case 'short':
      return `${address.slice(0, 4)}...${address.slice(-4)}`
    case 'medium':
      return `${address.slice(0, 6)}...${address.slice(-6)}`
    case 'long':
      return `${address.slice(0, 10)}...${address.slice(-10)}`
    default:
      return `${address.slice(0, 6)}...${address.slice(-6)}`
  }
}

// Format XLM amount from stroops
export function formatXLM(stroops: string | number | bigint): string {
  const value = typeof stroops === 'string' ? BigInt(stroops) : BigInt(stroops)
  const xlm = Number(value) / 10_000_000
  return xlm.toFixed(4)
}
