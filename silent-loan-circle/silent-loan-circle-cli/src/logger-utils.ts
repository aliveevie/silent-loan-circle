// Silent Loan Circle CLI - Logger Utilities
// Copyright (C) 2025 Midnight Foundation
// SPDX-License-Identifier: Apache-2.0

import pino from 'pino';
import { mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

export async function createLogger(logPath: string) {
  await mkdir(dirname(logPath), { recursive: true });
  
  return pino({
    level: 'info',
    transport: {
      targets: [
        {
          target: 'pino-pretty',
          level: 'info',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss.l',
            ignore: 'pid,hostname'
          }
        },
        {
          target: 'pino/file',
          level: 'info',
          options: {
            destination: logPath
          }
        }
      ]
    }
  });
}
