import { BehaviorSubject, Observable, firstValueFrom, interval, map, filter, take, timeout, throwError } from 'rxjs';
import { type Logger } from 'pino';
import {
  type DAppConnectorAPI,
  type DAppConnectorWalletAPI,
} from '@midnight-ntwrk/dapp-connector-api';
import {
  type ContractAddress,
  type SilentLoanCircleProviders,
  type CircleConfiguration,
} from '../api/common-types';
import { SilentLoanCircleAPI, type DeployedSilentLoanCircleAPI } from '../api';

export interface CircleDeployment {
  status: 'in-progress' | 'failed' | 'deployed';
  api?: DeployedSilentLoanCircleAPI;
  error?: Error;
}

export interface DeployedCircleAPIProvider {
  readonly circleDeployments$: Observable<Array<Observable<CircleDeployment>>>;
  readonly resolve: (contractAddress?: ContractAddress, configuration?: CircleConfiguration) => Observable<CircleDeployment>;
}

/**
 * Simplified Silent Loan Circle manager for hackathon - focuses on wallet connection and transaction signing
 */
export class HackathonSilentLoanCircleManager implements DeployedCircleAPIProvider {
  private readonly _circleDeploymentsSubject: BehaviorSubject<Array<BehaviorSubject<CircleDeployment>>>;
  private _connectedWallet: DAppConnectorWalletAPI | undefined;

  constructor(private readonly logger: Logger) {
    try {
      this.logger.info('🔧 Initializing HackathonSilentLoanCircleManager...');
      this._circleDeploymentsSubject = new BehaviorSubject<Array<BehaviorSubject<CircleDeployment>>>([]);
      this.logger.info('✅ HackathonSilentLoanCircleManager initialized successfully');
    } catch (error) {
      this.logger.error('❌ Failed to initialize HackathonSilentLoanCircleManager:', error);
      throw error;
    }
  }

  get circleDeployments$(): Observable<Array<Observable<CircleDeployment>>> {
    return this._circleDeploymentsSubject;
  }

  resolve(contractAddress?: ContractAddress, configuration?: CircleConfiguration): Observable<CircleDeployment> {
    const deployments = this._circleDeploymentsSubject.value;
    let deployment = deployments.find(
      (deployment) =>
        deployment.value.status === 'deployed' && 
        deployment.value.api?.deployedContractAddress === contractAddress,
    );

    if (deployment) {
      return deployment;
    }

    deployment = new BehaviorSubject<CircleDeployment>({
      status: 'in-progress',
    });

    deployments.push(deployment);
    this._circleDeploymentsSubject.next(deployments);

    if (contractAddress) {
      this.joinDeployment(deployment, contractAddress);
    } else if (configuration) {
      this.deployContract(deployment, configuration);
    } else {
      deployment.next({
        status: 'failed',
        error: new Error('Either contractAddress or configuration must be provided'),
      });
    }

    return deployment;
  }

  private async deployContract(deploymentSubject: BehaviorSubject<CircleDeployment>, configuration: CircleConfiguration): Promise<void> {
    try {
      this.logger.info('🚀 Starting contract deployment for hackathon...');

      // Get simple providers focused on wallet interaction
      const providers = await this.getSimpleProviders();

      // Deploy using the API (this will show the Lace wallet popup)
      const api = await SilentLoanCircleAPI.deploy(providers, configuration, this.logger);

      deploymentSubject.next({
        status: 'deployed',
        api,
      });

      this.logger.info('✅ Contract deployed successfully!');
    } catch (error) {
      this.logger.error('❌ Deployment failed:', error);
      deploymentSubject.next({
        status: 'failed',
        error: error as Error,
      });
    }
  }

  private async joinDeployment(deploymentSubject: BehaviorSubject<CircleDeployment>, contractAddress: ContractAddress): Promise<void> {
    try {
      this.logger.info('🔗 Joining existing contract...');

      const providers = await this.getSimpleProviders();
      const api = await SilentLoanCircleAPI.join(providers, contractAddress, this.logger);

      deploymentSubject.next({
        status: 'deployed',
        api,
      });
    } catch (error) {
      this.logger.error('❌ Join failed:', error);
      deploymentSubject.next({
        status: 'failed',
        error: error as Error,
      });
    }
  }

  private async getSimpleProviders(): Promise<SilentLoanCircleProviders> {
    // Connect to wallet if not already connected
    if (!this._connectedWallet) {
      this._connectedWallet = await this.connectToWallet();
    }

    const wallet = this._connectedWallet;

    return {
      privateStateProvider: {
        async get(key: string) {
          const stored = localStorage.getItem(`silent-loan-circle-${key}`);
          return stored ? JSON.parse(stored) : null;
        },
        async set(key: string, value: any) {
          localStorage.setItem(`silent-loan-circle-${key}`, JSON.stringify(value));
        },
        async delete(key: string) {
          localStorage.removeItem(`silent-loan-circle-${key}`);
        }
      },
      zkConfigProvider: null,
      proofProvider: null,
      publicDataProvider: null,
      walletProvider: {
        coinPublicKey: new Uint8Array([1,2,3]),
        encryptionPublicKey: new Uint8Array([4,5,6]),
        balanceTx: async (tx: any, newCoins: any[]) => {
          this.logger.info('🔄 Balancing transaction (hackathon mode)...');
          return tx; // Simple pass-through
        }
      },
      midnightProvider: {
        submitTx: async (tx: any) => {
          this.logger.info('📱 Sending transaction to Lace wallet for approval...');
          
          // THIS WILL SHOW THE LACE WALLET POPUP FOR APPROVAL
          const result = await wallet.submitTransaction(tx);
          
          this.logger.info('✅ Transaction approved by user!', result);
          return result;
        },
      },
    };
  }

  private async connectToWallet(): Promise<DAppConnectorWalletAPI> {
    this.logger.info('🔗 Connecting to Lace wallet (hackathon mode)...');

    return firstValueFrom(
      interval(100).pipe(
        map(() => window.midnight?.mnLace),
        filter((connectorAPI): connectorAPI is DAppConnectorAPI => !!connectorAPI),
        take(1),
        timeout({
          first: 10000,
          with: () => throwError(() => new Error('Lace wallet not found. Please install the Midnight Lace extension.'))
        })
      )
    ).then(async (connectorAPI) => {
      this.logger.info('✅ Found Lace wallet, enabling...');
      
      try {
        const wallet = await connectorAPI.enable();
        this.logger.info('🎉 Lace wallet connected and ready for transaction signing!');
        return wallet;
      } catch (error) {
        this.logger.error('❌ Failed to enable Lace wallet:', error);
        throw new Error(`Failed to enable Lace wallet: ${error}`);
      }
    });
  }
}
