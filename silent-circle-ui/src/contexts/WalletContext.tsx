import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { type WalletState, type WalletAction } from '../types/wallet';
import { walletService } from '../services/walletService';
import { useToast } from '@/components/ui/use-toast';

interface WalletContextType extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

const initialState: WalletState = {
  isConnected: false,
  isConnecting: false,
  address: undefined,
  balance: undefined,
  error: undefined,
};

function walletReducer(state: WalletState, action: WalletAction): WalletState {
  switch (action.type) {
    case 'CONNECTING':
      return {
        ...state,
        isConnecting: true,
        error: undefined,
      };
    case 'CONNECTED':
      return {
        ...state,
        isConnected: true,
        isConnecting: false,
        address: action.payload?.address,
        balance: action.payload?.balance,
        error: undefined,
      };
    case 'DISCONNECTED':
      return {
        ...initialState,
      };
    case 'ERROR':
      return {
        ...state,
        isConnecting: false,
        isConnected: false,
        error: action.payload?.error,
      };
    default:
      return state;
  }
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [state, dispatch] = useReducer(walletReducer, initialState);
  const { toast } = useToast();

  const connect = useCallback(async () => {
    try {
      dispatch({ type: 'CONNECTING' });
      
      const connection = await walletService.connect();
      
      dispatch({
        type: 'CONNECTED',
        payload: {
          address: connection.address,
        },
      });

      toast({
        title: "Wallet Connected",
        description: "Successfully connected to Midnight Lace wallet",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      dispatch({
        type: 'ERROR',
        payload: { error: errorMessage },
      });

      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [toast]);

  const disconnect = useCallback(async () => {
    try {
      await walletService.disconnect();
      dispatch({ type: 'DISCONNECTED' });
      
      toast({
        title: "Wallet Disconnected",
        description: "Successfully disconnected from wallet",
      });
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  }, [toast]);

  return (
    <WalletContext.Provider
      value={{
        ...state,
        connect,
        disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
