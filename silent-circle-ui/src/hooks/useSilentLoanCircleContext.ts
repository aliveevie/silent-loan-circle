// Silent Loan Circle Context Hook
// Copyright (C) 2025 Midnight Foundation
// SPDX-License-Identifier: Apache-2.0

import { useContext } from 'react';
import { SilentLoanCircleContext } from '../contexts/SilentLoanCircleContext';
import { type DeployedCircleAPIProvider } from '../contexts/SilentLoanCircleManager';

/**
 * A React hook that provides access to the currently in-scope deployed loan circle provider.
 *
 * @returns The currently in-scope deployed loan circle provider.
 *
 * @throws Will throw an error if the hook is used outside of a {@link SilentLoanCircleProvider}.
 */
export function useSilentLoanCircleContext(): DeployedCircleAPIProvider {
  const context = useContext(SilentLoanCircleContext);
  
  if (context === undefined) {
    throw new Error('useSilentLoanCircleContext must be used within a SilentLoanCircleProvider');
  }
  
  return context;
}
