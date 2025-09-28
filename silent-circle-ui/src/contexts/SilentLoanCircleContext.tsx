// Silent Loan Circle Context
// Copyright (C) 2025 Midnight Foundation
// SPDX-License-Identifier: Apache-2.0

import React, { type PropsWithChildren, createContext, useMemo } from 'react';
import { type DeployedCircleAPIProvider, SimpleHackathonManager } from './SimpleHackathonManager';
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
 * A React component that sets a new {@link SimpleHackathonManager} object as the currently
 * in-scope deployed loan circle provider.
 */
export const SilentLoanCircleProvider: React.FC<Readonly<SilentLoanCircleProviderProps>> = ({ logger, children }) => {
  const value = useMemo(() => {
    console.log('🔧 Creating SimpleHackathonManager with logger:', logger);
    return new SimpleHackathonManager(logger);
  }, [logger]);

  return (
    <SilentLoanCircleContext.Provider value={value}>
      {children}
    </SilentLoanCircleContext.Provider>
  );
};
