// Silent Loan Circle API Types
// Copyright (C) 2025 Midnight Foundation
// SPDX-License-Identifier: Apache-2.0

import { type MidnightProviders } from '@midnight-ntwrk/midnight-js-types';
import { type ContractAddress } from '@midnight-ntwrk/compact-runtime';

/**
 * Enumeration representing the various states of a Silent Loan Circle.
 */
export enum CircleState {
  JOINING = 0,
  ACTIVE = 1,
  COMPLETED = 2,
  DEFAULTED = 3
}

/**
 * The public state structure of the Silent Loan Circle contract
 */
export interface SilentLoanCircleState {
  readonly circleState: CircleState;
  readonly memberCount: number;
  readonly maxMembers: number;
  readonly contributionAmount: bigint;
  readonly currentCycleIndex: number;
  readonly payoutPointer: number;
  readonly interestRate: bigint;
  readonly adminAddress: Uint8Array;
}

/**
 * The private state maintained by each participant
 */
export interface SilentLoanCirclePrivateState {
  readonly secretKey: Uint8Array;
  readonly membershipProof: Uint8Array;
  readonly contributionHistory: readonly bigint[];
  readonly payoutHistory: readonly bigint[];
  readonly isAdmin: boolean;
}

/**
 * The derived state combining public and private information
 */
export interface SilentLoanCircleDerivedState {
  readonly state: SilentLoanCircleState;
  readonly sequence: bigint;
  readonly isMember: boolean;
  readonly isAdmin: boolean;
  readonly hasContributed: boolean;
  readonly canReceivePayout: boolean;
  readonly totalContributions: bigint;
  readonly expectedPayout: bigint;
  readonly remainingCycles: number;
}

/**
 * Contract witnesses type definition
 */
export type SilentLoanCircleWitnesses = Record<string, any>;

/**
 * Silent Loan Circle contract type
 */
export interface SilentLoanCircleContract {
  readonly impureCircuits: Record<string, any>;
  readonly witnesses: SilentLoanCircleWitnesses;
  readonly initialState: SilentLoanCirclePrivateState;
}

/**
 * The private state key used by the contract
 */
export const silentLoanCirclePrivateStateKey = 'silentLoanCirclePrivateState';
export type PrivateStateId = typeof silentLoanCirclePrivateStateKey;

/**
 * Private states schema for the application
 */
export type PrivateStates = {
  readonly [silentLoanCirclePrivateStateKey]: SilentLoanCirclePrivateState;
};

/**
 * Circuit keys available in the contract
 */
export type SilentLoanCircleCircuitKeys = 
  | 'joinGroup'
  | 'contributeToPool'
  | 'executePayout'
  | 'emergencyDefault'
  | 'getGroupParams'
  | 'getCurrentStatus';

/**
 * Providers required by the Silent Loan Circle contract
 */
export type SilentLoanCircleProviders = MidnightProviders<
  SilentLoanCircleCircuitKeys,
  PrivateStateId,
  SilentLoanCirclePrivateState
>;

/**
 * A deployed Silent Loan Circle contract
 */
export interface DeployedSilentLoanCircleContract {
  readonly deployTxData: {
    readonly public: {
      readonly contractAddress: ContractAddress;
    };
  };
}

/**
 * Configuration for creating a new Silent Loan Circle
 */
export interface CircleConfiguration {
  readonly maxMembers: number;
  readonly contributionAmount: bigint;
  readonly interestRate: bigint;
  readonly cycleDurationBlocks: bigint;
}

/**
 * Member information structure
 */
export interface CircleMember {
  readonly memberIndex: number;
  readonly address: string;
  readonly joinedAt: bigint;
  readonly hasContributed: boolean;
  readonly hasPaid: boolean;
}

/**
 * Payout information structure
 */
export interface PayoutInfo {
  readonly cycleIndex: number;
  readonly recipientIndex: number;
  readonly amount: bigint;
  readonly executedAt: bigint;
}

/**
 * Transaction result information
 */
export interface TransactionResult {
  readonly success: boolean;
  readonly transactionId?: string;
  readonly error?: string;
  readonly gasUsed?: bigint;
}
