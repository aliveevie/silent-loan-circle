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
import { type ContractAddress } from '@midnight-ntwrk/compact-runtime';
import { type Logger } from 'pino';
import semver from 'semver';

import {
  type DAppConnectorAPI,
  type DAppConnectorWalletAPI,
  type ServiceUriConfig,
} from '@midnight-ntwrk/dapp-connector-api';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import {
  type BalancedTransaction,
  type UnbalancedTransaction,
  createBalancedTx,
} from '@midnight-ntwrk/midnight-js-types';
import { type CoinInfo, Transaction, type TransactionId } from '@midnight-ntwrk/ledger';
import { getLedgerNetworkId, getZswapNetworkId } from '@midnight-ntwrk/midnight-js-network-id';

import {
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
    const { wallet, uris } = await this.connectToWallet();
    const walletState = await wallet.state();

    this.logger.info(`Connecting to wallet with network ID: ${getLedgerNetworkId()}`);

    return {
      privateStateProvider: levelPrivateStateProvider({
        stateStoreName: 'silent-loan-circle-private-state'
      }),
      publicDataProvider: indexerPublicDataProvider({
        indexerUri: uris.indexer,
        fetch,
      }),
      zkConfigProvider: new FetchZkConfigProvider(
        uris.zkConfigProvider,
        fetch,
      ),
      proofProvider: httpClientProofProvider({
        proverServerUri: uris.proverServer,
        fetch,
      }),
      walletProvider: {
        coinPublicKey: walletState.coinPublicKey,
        encryptionPublicKey: walletState.encryptionPublicKey,
        async getBalanceInfo(query: any): Promise<CoinInfo> {
          return wallet.getBalanceInfo(query);
        },
      },
      midnightProvider: {
        submitTx(tx: BalancedTransaction): Promise<TransactionId> {
          return wallet.submitTransaction(tx);
        },
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

  private async connectToWallet(): Promise<{ wallet: DAppConnectorWalletAPI; uris: ServiceUriConfig }> {
    const COMPATIBLE_CONNECTOR_API_VERSION = '1.x';

    return firstValueFrom(
      interval(100).pipe(
        map(() => window.midnight?.mnLace),
        tap((connectorAPI) => {
          this.logger.info(connectorAPI, 'Check for wallet connector API');
        }),
        filter((connectorAPI): connectorAPI is DAppConnectorAPI => !!connectorAPI),
        concatMap((connectorAPI) =>
          semver.satisfies(connectorAPI.apiVersion, COMPATIBLE_CONNECTOR_API_VERSION)
            ? of(connectorAPI)
            : throwError(() => {
                this.logger.error(
                  {
                    expected: COMPATIBLE_CONNECTOR_API_VERSION,
                    actual: connectorAPI.apiVersion,
                  },
                  'Incompatible version of wallet connector API',
                );

                return new Error(
                  `Incompatible version of Midnight Lace wallet found. Require '${COMPATIBLE_CONNECTOR_API_VERSION}', got '${connectorAPI.apiVersion}'.`,
                );
              }),
        ),
        tap((connectorAPI) => {
          this.logger.info(connectorAPI, 'Compatible wallet connector API found. Connecting.');
        }),
        take(1),
        timeout({
          first: 10_000,
          with: () =>
            throwError(() => {
              this.logger.error('Could not find wallet connector API');
              return new Error('Could not find Midnight Lace wallet. Extension installed?');
            }),
        }),
        concatMap(async (connectorAPI) => {
          const isEnabled = await connectorAPI.isEnabled();
          this.logger.info(isEnabled, 'Wallet connector API enabled status');
          return connectorAPI;
        }),
        timeout({
          first: 5_000,
          with: () =>
            throwError(() => {
              this.logger.error('Wallet connector API has failed to respond');
              return new Error('Midnight Lace wallet has failed to respond. Extension enabled?');
            }),
        }),
        concatMap(async (connectorAPI) => ({ 
          walletConnectorAPI: await connectorAPI.enable(), 
          connectorAPI 
        })),
        concatMap(async ({ walletConnectorAPI, connectorAPI }) => {
          const uris = await connectorAPI.getServiceUriConfig();
          this.logger.info('Connected to wallet connector API and retrieved service configuration');
          return { wallet: walletConnectorAPI, uris };
        })
      )
    );
  }
}
