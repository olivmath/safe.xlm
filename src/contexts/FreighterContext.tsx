import { createContext, useContext, ReactNode } from 'react'
import { useFreighter, UseFreighterReturn } from '../hooks/useFreighter'

const FreighterContext = createContext<UseFreighterReturn | undefined>(undefined)

export function FreighterProvider({ children }: { children: ReactNode }) {
  const freighter = useFreighter()

  return (
    <FreighterContext.Provider value={freighter}>
      {children}
    </FreighterContext.Provider>
  )
}

export function useFreighterContext(): UseFreighterReturn {
  const context = useContext(FreighterContext)
  if (!context) {
    throw new Error('useFreighterContext must be used within FreighterProvider')
  }
  return context
}
