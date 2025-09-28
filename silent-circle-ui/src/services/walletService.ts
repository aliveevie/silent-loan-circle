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
          console.log('Checking for wallet connector API:', !!connectorAPI);
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
          console.log('Compatible wallet connector API found. Connecting.');
        }),
        take(1),
        timeout({
          first: 10_000,
          with: () =>
            throwError(() => new Error('Could not find Midnight Lace wallet. Extension installed?'))
        }),
        concatMap(async (connectorAPI) => {
          const isEnabled = await connectorAPI.isEnabled();
          console.log('Wallet connector API enabled status:', isEnabled);
          return connectorAPI;
        }),
        timeout({
          first: 5_000,
          with: () =>
            throwError(() => new Error('Midnight Lace wallet has failed to respond. Extension enabled?'))
        }),
        concatMap(async (connectorAPI) => ({ 
          walletConnectorAPI: await connectorAPI.enable(), 
          connectorAPI 
        })),
        concatMap(async ({ walletConnectorAPI }) => {
          console.log('Connected to wallet connector API');
          return { wallet: walletConnectorAPI };
        })
      )
    );
  }
}

export const walletService = new WalletService();
