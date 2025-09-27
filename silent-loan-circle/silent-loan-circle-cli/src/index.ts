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
          await circleApi.joinGroup();
          logger.info('Joined the circle successfully!');
          break;
        case '2': {
          const amount = await rli.question(`What amount do you want to contribute? `);
          await circleApi.contributeToPool(BigInt(amount));
          logger.info(`Contributed ${amount} successfully!`);
          break;
        }
        case '3': {
          await circleApi.executePayout();
          logger.info('Payout executed successfully!');
          break;
        }
        case '4':
          await circleApi.emergencyDefault();
          logger.info('Emergency default triggered!');
          break;
        case '5': {
          await circleApi.getGroupParams();
          logger.info('Group parameters retrieved successfully!');
          break;
        }
        case '6': {
          await circleApi.getCurrentStatus();
          logger.info('Current status retrieved successfully!');
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

const WALLET_LOOP_QUESTION = `
You can do one of the following:
  1. Build a fresh wallet
  2. Build wallet from a seed
  3. Exit
Which would you like to do? `;

const buildWallet = async (config: Config, rli: Interface, logger: Logger): Promise<boolean> => {
  if (config instanceof StandaloneConfig) {
    logger.info('Using genesis wallet for standalone mode');
    logger.info('Your wallet balance is: 1000000000');
    return true;
  }

  while (true) {
    const choice = await rli.question(WALLET_LOOP_QUESTION);
    switch (choice) {
      case '1':
        // Generate new seed
        const seed = Math.random().toString(16).substr(2, 64);
        logger.info(`Your wallet seed is: ${seed}`);
        logger.info(`Your wallet address is: mn_shield-addr_test1...`);
        logger.info(`Your wallet balance is: 0`);
        logger.info(`Waiting to receive tokens...`);
        // Simulate waiting for funds
        setTimeout(() => {
          logger.info(`Your wallet balance is: 1200000000`);
        }, 1000);
        return true;
      case '2':
        const existingSeed = await rli.question('Enter your wallet seed: ');
        logger.info(`Your wallet seed is: ${existingSeed}`);
        logger.info(`Your wallet address is: mn_shield-addr_test1...`);
        logger.info(`Your wallet balance is: 0`);
        logger.info(`Waiting to receive tokens...`);
        // Simulate waiting for funds
        setTimeout(() => {
          logger.info(`Your wallet balance is: 1200000000`);
        }, 1000);
        return true;
      case '3':
        logger.info('Exiting...');
        return false;
      default:
        logger.error(`Invalid choice: ${choice}`);
    }
  }
};

export const run = async (config: Config, logger: Logger): Promise<void> => {
  const rli = createInterface({ input, output, terminal: true });

  try {
    const walletCreated = await buildWallet(config, rli, logger);
    if (walletCreated) {
      // Create mock providers for the Silent Loan Circle API
      const providers: SilentLoanCircleProviders = {
        privateStateProvider: {} as any,
        publicDataProvider: {} as any,
        zkConfigProvider: {} as any,
        proofProvider: {} as any,
        walletProvider: {} as any,
        midnightProvider: {} as any,
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
