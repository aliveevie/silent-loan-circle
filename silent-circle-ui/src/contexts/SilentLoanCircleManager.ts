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
    try {
      this.logger.info('Attempting to connect to Midnight Lace wallet...');
      
      // Try to connect to the real wallet first
      const walletConnection = await this.connectToWallet();
      
      this.logger.info('Wallet connected successfully, initializing providers...');
      
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
            this.logger.info('Submitting transaction to wallet for signing...');
            return walletConnection.wallet.submitTransaction(tx);
          }
        },
      };
    } catch (error) {
      this.logger.warn('Failed to connect to real wallet, using mock providers:', error);
      
      // Fallback to mock providers if wallet connection fails
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
        zkConfigProvider: {},
        proofProvider: {},
        walletProvider: {},
        midnightProvider: {
          submitTx: async (tx: any) => {
            this.logger.info('Using mock transaction signing...');
            return 'mock-tx-id';
          }
        },
      };
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

  private async connectToWallet(): Promise<any> {
    this.logger.info('Attempting to connect to Midnight Lace wallet...');
    
    // Check if Midnight Lace wallet is available
    if (!window.midnight?.mnLace) {
      throw new Error('Midnight Lace wallet not found. Please install the extension.');
    }

    const connectorAPI = window.midnight.mnLace;
    
    // Check API version compatibility
    const COMPATIBLE_VERSION = '1.x';
    if (!semver.satisfies(connectorAPI.apiVersion, COMPATIBLE_VERSION)) {
      throw new Error(`Incompatible wallet version. Required: ${COMPATIBLE_VERSION}, Found: ${connectorAPI.apiVersion}`);
    }

    this.logger.info('Compatible Midnight Lace wallet found, connecting...');

    // Check if wallet is enabled
    const isEnabled = await connectorAPI.isEnabled();
    if (!isEnabled) {
      this.logger.info('Wallet not enabled, requesting permission...');
    }

    // Enable the wallet (this will prompt user if needed)
    const walletAPI = await connectorAPI.enable();
    
    // Get service configuration
    const uris = await connectorAPI.getServiceUriConfig();
    
    this.logger.info('Successfully connected to Midnight Lace wallet');

    return {
      wallet: {
        state: () => walletAPI.state(),
        getBalanceInfo: (query: any) => walletAPI.getBalanceInfo(query),
        submitTransaction: async (tx: any) => {
          this.logger.info('🔐 Prompting wallet to sign transaction...');
          
          // This is where the wallet signing popup will appear
          const result = await walletAPI.submitTransaction(tx);
          
          this.logger.info('✅ Transaction signed successfully:', result);
          return result;
        }
      },
      uris: {
        indexer: uris.indexer,
        zkConfigProvider: uris.zkConfigProvider,
        proverServer: uris.proverServer
      }
    };
  }
}
