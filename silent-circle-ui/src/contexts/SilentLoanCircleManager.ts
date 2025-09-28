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
    this.logger.info('Initializing mock providers for development...');

    // Return mock providers for development
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
        submitTx: async (tx: any) => 'mock-tx-id'
      },
    };
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

  // Simplified for development - will implement real wallet connection later
  private async connectToWallet(): Promise<any> {
    this.logger.info('Mock wallet connection for development');
    return {
      wallet: {
        state: async () => ({ coinPublicKey: 'mock-key', encryptionPublicKey: 'mock-key' }),
        getBalanceInfo: async () => ({ amount: 1000n }),
        submitTransaction: async () => 'mock-tx-id'
      },
      uris: {
        indexer: 'mock-uri',
        zkConfigProvider: 'mock-uri',
        proverServer: 'mock-uri'
      }
    };
  }
}
