import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import {
  DEMO_USER,
  DEMO_WALLETS,
  DEMO_TRANSACTIONS,
  DEMO_NEW_WALLET,
  DEMO_NEW_TRANSACTION,
  DEMO_OWNERS,
} from "./mocks/data";

interface DemoTransaction {
  id: number;
  txType: "xlm" | "token";
  to: string;
  amount: string;
  executed: boolean;
  confirmations: string[];
}

interface DemoWallet {
  contractId: string;
  owners: string[];
  required: number;
  balance: string;
  txCount: number;
  transactions?: DemoTransaction[];
}

interface DemoModeState {
  isConnected: boolean;
  userAddress: string;
  userBalance: string;
  wallets: DemoWallet[];
  currentWallet: DemoWallet | null;
  currentStep: number;
  isModalOpen: boolean;
  modalType: "wallet" | "transaction" | null;
  newWalletCreated: boolean;
  newTransactionCreated: boolean;
  transactionConfirmed: boolean;
}

interface DemoModeContextType extends DemoModeState {
  nextStep: () => void;
  prevStep: () => void;
  setStep: (step: number) => void;
  openModal: (type: "wallet" | "transaction") => void;
  closeModal: () => void;
  createWallet: () => void;
  selectWallet: (contractId: string | null) => void;
  createTransaction: () => void;
  confirmTransaction: () => void;
  resetDemo: () => void;
}

const DemoModeContext = createContext<DemoModeContextType | null>(null);

const initialState: DemoModeState = {
  isConnected: true,
  userAddress: DEMO_USER.address,
  userBalance: DEMO_USER.balance,
  wallets: DEMO_WALLETS.map(w => ({
    ...w,
    transactions: DEMO_TRANSACTIONS,
  })),
  currentWallet: null,
  currentStep: 0,
  isModalOpen: false,
  modalType: null,
  newWalletCreated: false,
  newTransactionCreated: false,
  transactionConfirmed: false,
};

export function DemoModeProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoModeState>(initialState);

  const nextStep = useCallback(() => {
    setState(prev => ({ ...prev, currentStep: prev.currentStep + 1 }));
  }, []);

  const prevStep = useCallback(() => {
    setState(prev => ({ ...prev, currentStep: Math.max(0, prev.currentStep - 1) }));
  }, []);

  const setStep = useCallback((step: number) => {
    setState(prev => ({ ...prev, currentStep: step }));
  }, []);

  const openModal = useCallback((type: "wallet" | "transaction") => {
    setState(prev => ({ ...prev, isModalOpen: true, modalType: type }));
  }, []);

  const closeModal = useCallback(() => {
    setState(prev => ({ ...prev, isModalOpen: false, modalType: null }));
  }, []);

  const createWallet = useCallback(() => {
    setState(prev => {
      const newWallet: DemoWallet = {
        ...DEMO_NEW_WALLET,
        transactions: DEMO_TRANSACTIONS,
      };
      return {
        ...prev,
        wallets: [...prev.wallets, newWallet],
        newWalletCreated: true,
        isModalOpen: false,
        modalType: null,
      };
    });
  }, []);

  const selectWallet = useCallback((contractId: string | null) => {
    setState(prev => {
      if (!contractId) {
        return { ...prev, currentWallet: null };
      }
      const wallet = prev.wallets.find(w => w.contractId === contractId) || null;
      return { ...prev, currentWallet: wallet };
    });
  }, []);

  const createTransaction = useCallback(() => {
    setState(prev => {
      if (!prev.currentWallet) return prev;

      const updatedWallet: DemoWallet = {
        ...prev.currentWallet,
        txCount: prev.currentWallet.txCount + 1,
        transactions: [
          DEMO_NEW_TRANSACTION,
          ...(prev.currentWallet.transactions || []),
        ],
      };

      return {
        ...prev,
        currentWallet: updatedWallet,
        wallets: prev.wallets.map(w =>
          w.contractId === updatedWallet.contractId ? updatedWallet : w
        ),
        newTransactionCreated: true,
        isModalOpen: false,
        modalType: null,
      };
    });
  }, []);

  const confirmTransaction = useCallback(() => {
    setState(prev => {
      if (!prev.currentWallet || !prev.currentWallet.transactions) return prev;

      const updatedTransactions = prev.currentWallet.transactions.map((tx, idx) => {
        if (idx === 0 && !tx.executed) {
          const newConfirmations = [...tx.confirmations, DEMO_OWNERS[0]];
          const isExecuted = newConfirmations.length >= prev.currentWallet!.required;
          return {
            ...tx,
            confirmations: newConfirmations,
            executed: isExecuted,
          };
        }
        return tx;
      });

      const updatedWallet: DemoWallet = {
        ...prev.currentWallet,
        transactions: updatedTransactions,
      };

      return {
        ...prev,
        currentWallet: updatedWallet,
        wallets: prev.wallets.map(w =>
          w.contractId === updatedWallet.contractId ? updatedWallet : w
        ),
        transactionConfirmed: true,
      };
    });
  }, []);

  const resetDemo = useCallback(() => {
    setState(initialState);
  }, []);

  const value: DemoModeContextType = {
    ...state,
    nextStep,
    prevStep,
    setStep,
    openModal,
    closeModal,
    createWallet,
    selectWallet,
    createTransaction,
    confirmTransaction,
    resetDemo,
  };

  return (
    <DemoModeContext.Provider value={value}>
      {children}
    </DemoModeContext.Provider>
  );
}

export function useDemoMode() {
  const context = useContext(DemoModeContext);
  if (!context) {
    throw new Error("useDemoMode must be used within a DemoModeProvider");
  }
  return context;
}
