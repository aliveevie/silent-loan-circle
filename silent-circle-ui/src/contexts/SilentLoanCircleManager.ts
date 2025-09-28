// Silent Loan Circle Manager
// Copyright (C) 2025 Midnight Foundation
// SPDX-License-Identifier: Apache-2.0

import { 
  Observable, 
  BehaviorSubject, 
  firstValueFrom, 
  interval, 
  throwError, 
  of, 
  timeout, 
  take, 
  filter, 
  map, 
  tap, 
  concatMap 
} from 'rxjs';
import { type Logger } from 'pino';
import semver from 'semver';
import {
  type DAppConnectorAPI,
  type DAppConnectorWalletAPI,
  type ServiceUriConfig,
} from '@midnight-ntwrk/dapp-connector-api';

import {
  type ContractAddress,
  type SilentLoanCircleProviders,
  type CircleConfiguration,
  silentLoanCirclePrivateStateKey
} from '../api/common-types';
import { SilentLoanCircleAPI, type DeployedSilentLoanCircleAPI } from '../api';

/**
 * An in-progress loan circle deployment.
 */
export interface InProgressCircleDeployment {
  readonly status: 'in-progress';
}

/**
 * A deployed loan circle deployment.
 */
export interface DeployedCircleDeployment {
  readonly status: 'deployed';
  readonly api: DeployedSilentLoanCircleAPI;
}

/**
 * A failed loan circle deployment.
 */
export interface FailedCircleDeployment {
  readonly status: 'failed';
  readonly error: Error;
}

/**
 * A loan circle deployment.
 */
export type CircleDeployment = InProgressCircleDeployment | DeployedCircleDeployment | FailedCircleDeployment;

/**
 * Provides access to loan circle deployments.
 */
export interface DeployedCircleAPIProvider {
  /**
   * Gets the observable set of circle deployments.
   */
  readonly circleDeployments$: Observable<Array<Observable<CircleDeployment>>>;

  /**
   * Joins or deploys a loan circle contract.
   */
  readonly resolve: (contractAddress?: ContractAddress, configuration?: CircleConfiguration) => Observable<CircleDeployment>;
}

/**
 * A {@link DeployedCircleAPIProvider} that manages loan circle deployments in a browser setting.
 */
export class BrowserSilentLoanCircleManager implements DeployedCircleAPIProvider {
  readonly #circleDeploymentsSubject: BehaviorSubject<Array<BehaviorSubject<CircleDeployment>>>;
  #initializedProviders: Promise<SilentLoanCircleProviders> | undefined;

  constructor(private readonly logger: Logger) {
    this.#circleDeploymentsSubject = new BehaviorSubject<Array<BehaviorSubject<CircleDeployment>>>([]);
    this.circleDeployments$ = this.#circleDeploymentsSubject;
  }

  readonly circleDeployments$: Observable<Array<Observable<CircleDeployment>>>;

  resolve(contractAddress?: ContractAddress, configuration?: CircleConfiguration): Observable<CircleDeployment> {
    const deployments = this.#circleDeploymentsSubject.value;
    let deployment = deployments.find(
      (deployment) =>
        deployment.value.status === 'deployed' && 
        deployment.value.api.deployedContractAddress === contractAddress,
    );

    if (deployment) {
      return deployment;
    }

    deployment = new BehaviorSubject<CircleDeployment>({
      status: 'in-progress',
    });

    if (contractAddress) {
      void this.joinDeployment(deployment, contractAddress);
    } else {
      void this.deployDeployment(deployment, configuration);
    }

    this.#circleDeploymentsSubject.next([...deployments, deployment]);

    return deployment;
  }

  private getProviders(): Promise<SilentLoanCircleProviders> {
    this.#initializedProviders ??= this.initializeProviders();
    return this.#initializedProviders;
  }

  private async initializeProviders(): Promise<SilentLoanCircleProviders> {
    this.logger.info('🚀 Initializing providers with real Lace wallet integration...');
    
    try {
      // This will trigger the Lace wallet connection popup
      const walletConnection = await this.connectToWallet();
      
      this.logger.info('✅ Wallet connected successfully, setting up providers...');
      
      return {
        privateStateProvider: {
          get: async (key: string) => null,
          set: async (key: string, value: any) => {},
        },
        publicDataProvider: {
          contractStateObservable: (address: string, options: any) => {
            return new Observable(subscriber => {
              subscriber.next({ data: {} });
            });
          }
        },
        zkConfigProvider: walletConnection.uris.zkConfigProvider,
        proofProvider: walletConnection.uris.proverServer,
        walletProvider: walletConnection.wallet,
        midnightProvider: {
          submitTx: async (tx: any) => {
            this.logger.info('🔐 Sending transaction to Lace wallet for approval...');
            
            // This is the critical part - this will show the Lace wallet transaction approval popup
            try {
              const result = await walletConnection.wallet.submitTransaction(tx);
              this.logger.info('✅ Transaction approved and signed by user!', result);
              return result;
            } catch (error) {
              this.logger.error('❌ Transaction rejected or failed:', error);
              throw error;
            }
          }
        },
      };
    } catch (error) {
      this.logger.error('❌ Failed to connect to Lace wallet:', error);
      throw error; // Don't fall back to mock - we want real wallet interaction
    }
  }

  private async joinDeployment(
    deploymentSubject: BehaviorSubject<CircleDeployment>,
    contractAddress: ContractAddress,
  ): Promise<void> {
    try {
      const providers = await this.getProviders();
      const api = await SilentLoanCircleAPI.join(providers, contractAddress, this.logger);

      deploymentSubject.next({
        status: 'deployed',
        api,
      });
    } catch (error) {
      this.logger.error(error, 'Failed to join loan circle');
      deploymentSubject.next({
        status: 'failed',
        error: error as Error,
      });
    }
  }

  private async deployDeployment(
    deploymentSubject: BehaviorSubject<CircleDeployment>,
    configuration?: CircleConfiguration,
  ): Promise<void> {
    try {
      const providers = await this.getProviders();
      const config = configuration || {
        maxMembers: 10,
        contributionAmount: 1000n,
        interestRate: 500n, // 5%
        cycleDurationBlocks: 1000n
      };
      
      const api = await SilentLoanCircleAPI.deploy(providers, config, this.logger);

      deploymentSubject.next({
        status: 'deployed',
        api,
      });
    } catch (error) {
      this.logger.error(error, 'Failed to deploy loan circle');
      deploymentSubject.next({
        status: 'failed',
        error: error as Error,
      });
    }
  }

  private async connectToWallet(): Promise<{ wallet: DAppConnectorWalletAPI; uris: ServiceUriConfig }> {
    this.logger.info('🔍 Checking for Midnight Lace wallet...');
    
    return new Promise((resolve, reject) => {
      // Check if Midnight Lace wallet is available
      if (!window.midnight?.mnLace) {
        reject(new Error('❌ Midnight Lace wallet not found. Please install the Lace wallet extension from https://www.lace.io'));
        return;
      }

      const connectorAPI: DAppConnectorAPI = window.midnight.mnLace;
      this.logger.info('✅ Midnight Lace wallet detected!');
      
      // Check API version compatibility
      const COMPATIBLE_VERSION = '1.x';
      if (!semver.satisfies(connectorAPI.apiVersion, COMPATIBLE_VERSION)) {
        reject(new Error(`❌ Incompatible wallet version. Required: ${COMPATIBLE_VERSION}, Found: ${connectorAPI.apiVersion}`));
        return;
      }

      this.logger.info('🔗 Compatible Midnight Lace wallet found, requesting connection...');

      // This is the key part - enable() will show the Lace wallet popup
      connectorAPI.enable()
        .then(async (walletAPI: DAppConnectorWalletAPI) => {
          this.logger.info('🎉 Wallet connection approved by user!');
          
          // Get service configuration
          const uris = await connectorAPI.getServiceUriConfig();
          
          resolve({
            wallet: walletAPI,
            uris: uris
          });
        })
        .catch((error) => {
          this.logger.error('❌ Wallet connection failed:', error);
          reject(new Error(`Failed to connect to Midnight Lace wallet: ${error.message}`));
        });
    });
  }
}
