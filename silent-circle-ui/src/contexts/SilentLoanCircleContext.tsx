// Silent Loan Circle Context
// Copyright (C) 2025 Midnight Foundation
// SPDX-License-Identifier: Apache-2.0

import React, { type PropsWithChildren, createContext } from 'react';
import { type DeployedCircleAPIProvider, BrowserSilentLoanCircleManager } from './SilentLoanCircleManager';
import { type Logger } from 'pino';

/**
 * Encapsulates a deployed loan circles provider as a context object.
 */
export const SilentLoanCircleContext = createContext<DeployedCircleAPIProvider | undefined>(undefined);

/**
 * The props required by the {@link SilentLoanCircleProvider} component.
 */
export type SilentLoanCircleProviderProps = PropsWithChildren<{
  /** The `pino` logger to use. */
  logger: Logger;
}>;

/**
 * A React component that sets a new {@link BrowserSilentLoanCircleManager} object as the currently
 * in-scope deployed loan circle provider.
 */
export const SilentLoanCircleProvider: React.FC<Readonly<SilentLoanCircleProviderProps>> = ({ logger, children }) => (
  <SilentLoanCircleContext.Provider value={new BrowserSilentLoanCircleManager(logger)}>
    {children}
  </SilentLoanCircleContext.Provider>
);
