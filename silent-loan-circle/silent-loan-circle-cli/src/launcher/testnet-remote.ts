// Silent Loan Circle CLI - Testnet Remote Launcher
// Copyright (C) 2025 Midnight Foundation
// SPDX-License-Identifier: Apache-2.0

import { createLogger } from '../logger-utils.js';
import { run } from '../index.js';
import { TestnetRemoteConfig } from '../config.js';

async function main() {
  try {
    const config = new TestnetRemoteConfig();
    config.setNetworkId();
    const logger = await createLogger(config.logDir);
    await run(config, logger);
  } catch (error) {
    console.error('Failed to start Silent Loan Circle CLI:', error);
    process.exit(1);
  }
}

main();
