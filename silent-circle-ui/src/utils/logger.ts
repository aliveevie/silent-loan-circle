// Logger Utility
// Copyright (C) 2025 Midnight Foundation
// SPDX-License-Identifier: Apache-2.0

import pino from 'pino';

/**
 * Create a default pino logger for the application
 */
export const createLogger = (level: string = 'info') => {
  return pino({
    level,
    browser: {
      asObject: true,
    },
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  });
};

export const logger = createLogger(import.meta.env.VITE_LOG_LEVEL || 'info');
