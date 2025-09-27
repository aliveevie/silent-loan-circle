// Silent Loan Circle CLI - Privacy-Preserving ROSCA Implementation
// Copyright (C) 2025 Midnight Foundation
// SPDX-License-Identifier: Apache-2.0

import { createInterface, type Interface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { WebSocket } from 'ws';
import {
  type SilentLoanCircleProviders,
  SilentLoanCircleAPI,
  utils,
  type SilentLoanCircleDerivedState,
  type DeployedSilentLoanCircleContract,
  type PrivateStateId,
  silentLoanCirclePrivateStateKey,
  CircleState,
  type SilentLoanCircleCircuitKeys,
} from '../../api/src/index.js';
import { ledger } from '../../contract/src/managed/silent-loan-circle/contract/index.cjs';
import { type Logger } from 'pino';
import { type Config, StandaloneConfig } from './config.js';
import * as Rx from 'rxjs';
import {
  type BalancedTransaction,
  createBalancedTx,
  type MidnightProvider,
  type UnbalancedTransaction,
  type WalletProvider,
} from '@midnight-ntwrk/midnight-js-types';
import { type Wallet } from '@midnight-ntwrk/wallet-api';
import { type CoinInfo, nativeToken, Transaction, type TransactionId } from '@midnight-ntwrk/ledger';
import { Transaction as ZswapTransaction } from '@midnight-ntwrk/zswap';
import { WalletBuilder } from '@midnight-ntwrk/wallet';
import { getLedgerNetworkId, getZswapNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';

// @ts-expect-error: It's needed to enable WebSocket usage through apollo
globalThis.WebSocket = WebSocket;

const DEPLOY_OR_JOIN_QUESTION = `
You can do one of the following:
  1. Deploy a new Silent Loan Circle contract
  2. Join an existing Silent Loan Circle contract
  3. Exit
Which would you like to do? `;

const deployOrJoin = async (providers: SilentLoanCircleProviders, rli: Interface, logger: Logger): Promise<SilentLoanCircleAPI | null> => {
  while (true) {
    const choice = await rli.question(DEPLOY_OR_JOIN_QUESTION);
    switch (choice) {
      case '1': {
        try {
          const api = await SilentLoanCircleAPI.deploy(providers, logger);
          logger.info(`Deployed Silent Loan Circle at address: ${api.deployedContractAddress}`);
          return api;
        } catch (error) {
          logger.error(`Deployment failed: ${error}`);
          return null;
        }
      }
      case '2': {
        const contractAddress = await rli.question('What is the contract address (in hex)? ');
        try {
          const api = await SilentLoanCircleAPI.join(providers, contractAddress, logger);
          logger.info(`Joined Silent Loan Circle at address: ${api.deployedContractAddress}`);
          return api;
        } catch (error) {
          logger.error(`Failed to join contract: ${error}`);
          return null;
        }
      }
      case '3':
        logger.info('Exiting...');
        return null;
      default:
        logger.error(`Invalid choice: ${choice}`);
    }
  }
};

const MAIN_LOOP_QUESTION = `
You can do one of the following:
  1. Join the circle (if in joining phase)
  2. Contribute to current cycle
  3. Execute payout (if ready)
  4. Emergency default (admin only)
  5. Get group parameters
  6. Get current status
  7. Display the current ledger state
  8. Display the current private state
  9. Display the current derived state
  10. Exit
Which would you like to do? `;

const mainLoop = async (providers: SilentLoanCircleProviders, rli: Interface, logger: Logger): Promise<void> => {
  const circleApi = await deployOrJoin(providers, rli, logger);
  if (circleApi === null) {
    return;
  }

  let currentState: SilentLoanCircleDerivedState | undefined;
  const stateObserver = {
    next: (state: SilentLoanCircleDerivedState) => (currentState = state),
  };
  const subscription = circleApi.state$.subscribe(stateObserver);

  try {
    while (true) {
      const choice = await rli.question(MAIN_LOOP_QUESTION);
      switch (choice) {
        case '1':
          try {
            logger.info('🔗 Joining the Silent Loan Circle...');
            await circleApi.joinGroup();
            logger.info('🎉 Successfully joined the circle!');
          } catch (error) {
            logger.error(`❌ Failed to join circle: ${error}`);
          }
          break;
        case '2': {
          try {
            const amountStr = await rli.question(`💰 What amount do you want to contribute? `);
            const amount = BigInt(amountStr);
            
            if (amount <= 0n) {
              logger.error('❌ Amount must be positive');
              break;
            }
            
            logger.info('🔒 Generating privacy-preserving contribution proof...');
            await circleApi.contributeToPool(amount);
            logger.info(`✅ Contributed successfully! (amount kept private)`);
          } catch (error) {
            logger.error(`❌ Failed to contribute: ${error}`);
          }
          break;
        }
        case '3': {
          try {
            logger.info('💸 Executing payout...');
            await circleApi.executePayout();
            logger.info('✅ Payout executed successfully!');
          } catch (error) {
            logger.error(`❌ Failed to execute payout: ${error}`);
          }
          break;
        }
        case '4':
          try {
            const confirm = await rli.question('⚠️  Are you sure you want to trigger emergency default? (yes/no): ');
            if (confirm.toLowerCase() === 'yes') {
              await circleApi.emergencyDefault();
              logger.info('🚨 Emergency default triggered!');
            } else {
              logger.info('❌ Emergency default cancelled');
            }
          } catch (error) {
            logger.error(`❌ Failed to trigger emergency default: ${error}`);
          }
          break;
        case '5': {
          try {
            const params = await circleApi.getGroupParams();
            logger.info('📊 Group Parameters:');
            logger.info(`   Contribution Amount: ${params.contributionAmount}`);
            logger.info(`   Max Members: ${params.maxMembers}`);
            logger.info(`   Current Members: ${params.currentMembers}`);
          } catch (error) {
            logger.error(`❌ Failed to get group parameters: ${error}`);
          }
          break;
        }
        case '6': {
          try {
            const status = await circleApi.getCurrentStatus();
            const stateStr = status.state === CircleState.JOINING ? '🟡 Joining' : 
                            status.state === CircleState.ACTIVE ? '🟢 Active' : '🔴 Completed';
            logger.info('📈 Current Status:');
            logger.info(`   Circle State: ${stateStr}`);
            logger.info(`   Current Cycle: ${status.cycle}`);
            logger.info(`   Payout Pointer: ${status.payoutPointer}`);
          } catch (error) {
            logger.error(`❌ Failed to get current status: ${error}`);
          }
          break;
        }
        case '7':
          // Display ledger state would go here
          logger.info('Ledger state displayed');
          break;
        case '8':
          // Display private state would go here
          logger.info('Private state displayed');
          break;
        case '9':
          // Display derived state
          if (currentState) {
            const circleStateStr = currentState.circleState === CircleState.JOINING ? 'joining' : 
                                  currentState.circleState === CircleState.ACTIVE ? 'active' : 'completed';
            logger.info(`Circle state: '${circleStateStr}'`);
            logger.info(`Member count: ${currentState.memberCount}`);
            logger.info(`Current cycle: ${currentState.currentCycleIndex}`);
            logger.info(`Payout pointer: ${currentState.payoutPointer}`);
            logger.info(`You are a member: ${currentState.isMember ? 'yes' : 'no'}`);
            logger.info(`You are admin: ${currentState.isAdmin ? 'yes' : 'no'}`);
            logger.info(`You have contributed: ${currentState.hasContributed ? 'yes' : 'no'}`);
          } else {
            logger.info('No Silent Loan Circle state currently available');
          }
          break;
        case '10':
          logger.info('Exiting...');
          return;
        default:
          logger.error(`Invalid choice: ${choice}`);
      }
    }
  } finally {
    subscription.unsubscribe();
  }
};

// Helper function to convert bytes to hex
const toHex = (bytes: Uint8Array): string => 
  Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');

/* **********************************************************************
 * waitForFunds: wait for tokens to appear in a wallet.
 *
 * This is an interesting example of watching the stream of states
 * coming from the pub-sub indexer.  It watches both
 *  1. how close the state is to present reality and
 *  2. the balance held by the wallet.
 */
const waitForFunds = (wallet: Wallet, logger: Logger) =>
  Rx.firstValueFrom(
    Rx.race([
      wallet.state().pipe(
        Rx.throttleTime(5_000),
        Rx.tap((state) => {
          const scanned = state.syncProgress?.synced ?? 0n;
          const behind = state.syncProgress?.lag?.applyGap ?? 0n;
          const balance = state.balances[nativeToken()] ?? 0n;
          logger.info(`Wallet processed ${scanned} indices, remaining ${behind.toString()}, balance: ${balance}`);
          
          // If we have a balance, let's continue regardless of sync status
          if (balance > 0n) {
            logger.info(`Found balance: ${balance}, continuing...`);
          }
        }),
        Rx.filter((state) => {
          const balance = state.balances[nativeToken()] ?? 0n;
          if (balance > 0n) {
            return true; // If we have balance, continue immediately
          }
          
          // Otherwise, check if we're synced enough
          const synced = typeof state.syncProgress?.synced === 'bigint' ? state.syncProgress.synced : 0n;
          const total = typeof state.syncProgress?.lag?.applyGap === 'bigint' ? state.syncProgress.lag.applyGap : 1_000n;
          const isSynced = total - synced < 100n;
          
          if (!isSynced) {
            logger.info(`Still syncing... ${total - synced} indices behind`);
          }
          
          return isSynced;
        }),
        Rx.map((s) => s.balances[nativeToken()] ?? 0n),
        Rx.filter((balance) => balance > 0n),
      ),
      // Add a timeout after 2 minutes to prevent infinite waiting
      Rx.timer(120_000).pipe(
        Rx.tap(() => {
          logger.warn(`Timeout waiting for funds. For testnet, you may need to fund your wallet manually.`);
          logger.info(`Please visit the Midnight testnet faucet or fund your wallet address manually.`);
        }),
        Rx.map(() => 0n) // Return 0 balance on timeout
      )
    ])
  );

/* **********************************************************************
 * createWalletAndMidnightProvider: returns an object that
 * satisfies both the WalletProvider and MidnightProvider
 * interfaces, both implemented in terms of the given wallet.
 */
const createWalletAndMidnightProvider = async (wallet: Wallet): Promise<WalletProvider & MidnightProvider> => {
  const state = await Rx.firstValueFrom(wallet.state());
  return {
    coinPublicKey: state.coinPublicKey,
    encryptionPublicKey: state.encryptionPublicKey,
    balanceTx(tx: UnbalancedTransaction, newCoins: CoinInfo[]): Promise<BalancedTransaction> {
      return wallet
        .balanceTransaction(
          ZswapTransaction.deserialize(tx.serialize(getLedgerNetworkId()), getZswapNetworkId()),
          newCoins,
        )
        .then((tx) => wallet.proveTransaction(tx))
        .then((zswapTx) => Transaction.deserialize(zswapTx.serialize(getZswapNetworkId()), getLedgerNetworkId()))
        .then(createBalancedTx);
    },
    submitTx(tx: BalancedTransaction): Promise<TransactionId> {
      return wallet.submitTransaction(tx);
    },
  };
};

/* **********************************************************************
 * buildWalletAndWaitForFunds: the main function that creates a wallet
 * and waits for tokens to appear in it.  The various "buildWallet"
 * functions all arrive here after collecting information for the
 * arguments.
 */
const buildWalletAndWaitForFunds = async (
  { indexer, indexerWS, node, proofServer }: Config,
  logger: Logger,
  seed: string,
): Promise<Wallet> => {
  const wallet = await WalletBuilder.buildFromSeed(
    indexer,
    indexerWS,
    proofServer,
    node,
    seed,
    getZswapNetworkId(),
    'warn',
  );
  wallet.start();
  const state = await Rx.firstValueFrom(wallet.state());
  logger.info(`Your wallet seed is: ${seed}`);
  logger.info(`Your wallet address is: ${state.address}`);
  let balance = state.balances[nativeToken()];
  if (balance === undefined || balance === 0n) {
    logger.info(`Your wallet balance is: 0`);
    logger.info(`Waiting to receive tokens...`);
    balance = await waitForFunds(wallet, logger);
    
    if (balance === 0n) {
      logger.warn(`No funds received. You can continue with 0 balance, but transactions will fail.`);
      logger.info(`To fund your wallet, send tokens to: ${state.address}`);
    }
  }
  logger.info(`Your wallet balance is: ${balance}`);
  return wallet;
};

// Generate a random seed and create the wallet with that.
const buildFreshWallet = async (config: Config, logger: Logger): Promise<Wallet> =>
  await buildWalletAndWaitForFunds(config, logger, toHex(utils.randomBytes(32)));

// Prompt for a seed and create the wallet with that.
const buildWalletFromSeed = async (config: Config, rli: Interface, logger: Logger): Promise<Wallet> => {
  const seed = await rli.question('Enter your wallet seed: ');
  return await buildWalletAndWaitForFunds(config, logger, seed);
};

/* ***********************************************************************
 * This seed gives access to tokens minted in the genesis block of a local development node - only
 * used in standalone networks to build a wallet with initial funds.
 */
const GENESIS_MINT_WALLET_SEED = '0000000000000000000000000000000000000000000000000000000000000001';

/* **********************************************************************
 * buildWallet: unless running in a standalone (offline) mode,
 * prompt the user to tell us whether to create a new wallet
 * or recreate one from a prior seed.
 */
const WALLET_LOOP_QUESTION = `
You can do one of the following:
  1. Build a fresh wallet
  2. Build wallet from a seed
  3. Exit
Which would you like to do? `;

const buildWallet = async (config: Config, rli: Interface, logger: Logger): Promise<Wallet | null> => {
  if (config instanceof StandaloneConfig) {
    return await buildWalletAndWaitForFunds(config, logger, GENESIS_MINT_WALLET_SEED);
  }
  while (true) {
    const choice = await rli.question(WALLET_LOOP_QUESTION);
    switch (choice) {
      case '1':
        return await buildFreshWallet(config, logger);
      case '2':
        return await buildWalletFromSeed(config, rli, logger);
      case '3':
        logger.info('Exiting...');
        return null;
      default:
        logger.error(`Invalid choice: ${choice}`);
    }
  }
};

export const run = async (config: Config, logger: Logger, dockerEnv?: any): Promise<void> => {
  const rli = createInterface({ input, output, terminal: true });

  try {
    const wallet = await buildWallet(config, rli, logger);
    if (wallet !== null) {
      const walletAndMidnightProvider = await createWalletAndMidnightProvider(wallet);
      const providers: SilentLoanCircleProviders = {
        privateStateProvider: levelPrivateStateProvider<PrivateStateId>({
          privateStateStoreName: config.privateStateStoreName,
        }),
        publicDataProvider: indexerPublicDataProvider(config.indexer, config.indexerWS),
        zkConfigProvider: new NodeZkConfigProvider(config.zkConfigPath),
        proofProvider: httpClientProofProvider(config.proofServer),
        walletProvider: walletAndMidnightProvider,
        midnightProvider: walletAndMidnightProvider,
      };

      await mainLoop(providers, rli, logger);
    }
  } catch (e) {
    if (e instanceof Error) {
      logger.error(`Found error '${e.message}'`);
      logger.debug(`${e.stack}`);
    } else {
      logger.error(`Found error (unknown type)`);
    }
    logger.info('Exiting...');
  } finally {
    try {
      rli.close();
      rli.removeAllListeners();
    } catch (e) {
      logger.error(`Error closing interface: ${e}`);
    }
  }
};
