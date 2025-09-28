import { 
  type DAppConnectorAPI,
  type DAppConnectorWalletAPI 
} from '@midnight-ntwrk/dapp-connector-api';
import { firstValueFrom, interval, throwError, of, timeout, take, filter, map, tap, concatMap } from 'rxjs';
import semver from 'semver';

export interface WalletConnection {
  wallet: DAppConnectorWalletAPI;
  isConnected: boolean;
  address?: string;
}

class WalletService {
  private wallet: DAppConnectorWalletAPI | null = null;
  private isConnected = false;
  private readonly COMPATIBLE_CONNECTOR_API_VERSION = '1.x';

  async connect(): Promise<WalletConnection> {
    try {
      const { wallet } = await this.connectToWallet();
      const walletState = await wallet.state();
      
      this.wallet = wallet;
      this.isConnected = true;

      return {
        wallet,
        isConnected: true,
        address: walletState.coinPublicKey // or appropriate address field
      };
    } catch (error) {
      this.isConnected = false;
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    this.wallet = null;
    this.isConnected = false;
  }

  getWallet(): DAppConnectorWalletAPI | null {
    return this.wallet;
  }

  isWalletConnected(): boolean {
    return this.isConnected && this.wallet !== null;
  }

  private async connectToWallet(): Promise<{ wallet: DAppConnectorWalletAPI }> {
    return firstValueFrom(
      interval(100).pipe(
        map(() => window.midnight?.mnLace),
        tap((connectorAPI) => {
          console.log('🔍 Checking for Midnight Lace wallet...', !!connectorAPI);
        }),
        filter((connectorAPI): connectorAPI is DAppConnectorAPI => !!connectorAPI),
        concatMap((connectorAPI) =>
          semver.satisfies(connectorAPI.apiVersion, this.COMPATIBLE_CONNECTOR_API_VERSION)
            ? of(connectorAPI)
            : throwError(() => 
                new Error(
                  `Incompatible version of Midnight Lace wallet found. Require '${this.COMPATIBLE_CONNECTOR_API_VERSION}', got '${connectorAPI.apiVersion}'.`
                )
              )
        ),
        tap(() => {
          console.log('✅ Compatible Midnight Lace wallet found. Connecting...');
        }),
        take(1),
        timeout({
          first: 10_000,
          with: () =>
            throwError(() => new Error('❌ Could not find Midnight Lace wallet. Please install the extension and try again.'))
        }),
        concatMap(async (connectorAPI) => {
          const isEnabled = await connectorAPI.isEnabled();
          console.log('🔐 Wallet enabled status:', isEnabled);
          if (!isEnabled) {
            console.log('🔓 Requesting wallet permission...');
          }
          return connectorAPI;
        }),
        timeout({
          first: 15_000, // Increased timeout for user interaction
          with: () =>
            throwError(() => new Error('❌ Midnight Lace wallet failed to respond. Please check if the extension is enabled.'))
        }),
        concatMap(async (connectorAPI) => {
          console.log('🚀 Enabling wallet connection...');
          const walletConnectorAPI = await connectorAPI.enable();
          return { walletConnectorAPI };
        }),
        concatMap(async ({ walletConnectorAPI }) => {
          console.log('🎉 Successfully connected to Midnight Lace wallet!');
          return { wallet: walletConnectorAPI };
        })
      )
    );
  }
}

export const walletService = new WalletService();
