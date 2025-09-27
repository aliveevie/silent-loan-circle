// This file is part of SILENT-LOAN-CIRCLE.
// Copyright (C) 2025 Midnight Foundation
// SPDX-License-Identifier: Apache-2.0
// Licensed under the Apache License, Version 2.0 (the "License");
// You may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * Silent loan circle common types and abstractions.
 *
 * @module
 */

import { type MidnightProviders } from '@midnight-ntwrk/midnight-js-types';
import { type FoundContract } from '@midnight-ntwrk/midnight-js-contracts';
import type { State, SilentLoanCirclePrivateState, Contract, Witnesses } from '../../contract/src/index';

export const silentLoanCirclePrivateStateKey = 'silentLoanCirclePrivateState';
export type PrivateStateId = typeof silentLoanCirclePrivateStateKey;

/**
 * The private states consumed throughout the application.
 *
 * @remarks
 * {@link PrivateStates} can be thought of as a type that describes a schema for all
 * private states for all contracts used in the application. Each key represents
 * the type of private state consumed by a particular type of contract.
 * The key is used by the deployed contract when interacting with a private state provider,
 * and the type (i.e., `typeof PrivateStates[K]`) represents the type of private state
 * expected to be returned.
 *
 * Since there is only one contract type for the silent loan circle example, we only define a
 * single key/type in the schema.
 *
 * @public
 */
export type PrivateStates = {
  /**
   * Key used to provide the private state for {@link SilentLoanCircleContract} deployments.
   */
  readonly silentLoanCirclePrivateState: SilentLoanCirclePrivateState;
};

/**
 * Represents a silent loan circle contract and its private state.
 *
 * @public
 */
export type SilentLoanCircleContract = Contract<SilentLoanCirclePrivateState, Witnesses<SilentLoanCirclePrivateState>>;

/**
 * The keys of the circuits exported from {@link SilentLoanCircleContract}.
 *
 * @public
 */
export type SilentLoanCircleCircuitKeys = Exclude<keyof SilentLoanCircleContract['impureCircuits'], number | symbol>;

/**
 * The providers required by {@link SilentLoanCircleContract}.
 *
 * @public
 */
export type SilentLoanCircleProviders = MidnightProviders<SilentLoanCircleCircuitKeys, PrivateStateId, SilentLoanCirclePrivateState>;

/**
 * A {@link SilentLoanCircleContract} that has been deployed to the network.
 *
 * @public
 */
export type DeployedSilentLoanCircleContract = FoundContract<SilentLoanCircleContract>;

/**
 * A type that represents the derived combination of public (or ledger), and private state.
 */
export type SilentLoanCircleDerivedState = {
  readonly state: State;
  readonly sequence: bigint;
  readonly loanAmount: bigint | undefined;
  readonly interestRate: bigint | undefined;
  readonly participants: readonly string[];

  /**
   * A readonly flag that determines if the current user is a participant in the loan circle.
   */
  readonly isParticipant: boolean;
};
