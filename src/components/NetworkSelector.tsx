import { ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useNetwork } from '../contexts/NetworkContext'
import { useFreighterContext } from '../contexts/FreighterContext'
import { StellarNetwork } from '../config/networks'
import { formatXLM } from '../lib/utils'
import { StellarLogo } from './StellarLogo'

// Mock balance - in real app would come from Horizon API
const MOCK_BALANCE = '1234567890' // ~123.45 XLM

const networks: { id: StellarNetwork; label: string; color: string }[] = [
  { id: 'testnet', label: 'Testnet', color: 'bg-purple-500' },
  { id: 'futurenet', label: 'Futurenet', color: 'bg-orange-500' },
  { id: 'localnet', label: 'Localnet', color: 'bg-green-500' },
]

export function NetworkSelector() {
  const { publicKey } = useFreighterContext()
  const { network, setNetwork } = useNetwork()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentNetwork = networks.find((n) => n.id === network) || networks[1]

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleNetworkSwitch = (networkId: StellarNetwork) => {
    setNetwork(networkId)
    setIsOpen(false)
  }

  // Mock formatted balance
  const formattedBalance = publicKey ? formatXLM(MOCK_BALANCE) : '0.0000'

  return (
    <div className="flex items-center gap-3">
      {/* Balance */}
      <div className="hidden sm:flex items-center gap-2 h-10 px-3 rounded-lg bg-card border border-border">
        <StellarLogo size={16} />
        <span className="text-sm font-medium">{formattedBalance} XLM</span>
      </div>

      {/* Network Selector */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 h-10 px-3 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors"
        >
          <div className={`w-2 h-2 rounded-full ${currentNetwork.color}`} />
          <span className="text-sm font-medium">{currentNetwork.label}</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full right-0 mt-2 w-40 rounded-lg bg-card border border-border shadow-lg overflow-hidden z-50">
            {networks.map((net) => (
              <button
                key={net.id}
                onClick={() => handleNetworkSwitch(net.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors ${
                  network === net.id ? 'bg-primary/10 text-primary' : ''
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${net.color}`} />
                <span>{net.label}</span>
                {network === net.id && (
                  <span className="ml-auto text-xs text-primary">Active</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
