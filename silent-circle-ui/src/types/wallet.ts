// Type definitions for Midnight Lace wallet integration

export interface WalletState {
  isConnected: boolean;
  isConnecting: boolean;
  address?: string;
  balance?: string;
  error?: string;
}

export interface WalletAction {
  type: 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  payload?: {
    address?: string;
    balance?: string;
    error?: string;
  };
}

// Extend the global window interface to include midnight
declare global {
  interface Window {
    midnight?: {
      mnLace?: import('@midnight-ntwrk/dapp-connector-api').DAppConnectorAPI;
    };
  }
}
