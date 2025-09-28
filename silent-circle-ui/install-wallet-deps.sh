#!/bin/bash

# Installation script for Silent Loan Circle dependencies
echo "Installing Silent Loan Circle and Midnight Lace wallet dependencies..."

# Core Midnight dependencies
npm install @midnight-ntwrk/dapp-connector-api@^3.0.0
npm install @midnight-ntwrk/compact-runtime@^0.8.1
npm install @midnight-ntwrk/ledger@^4.0.0
npm install @midnight-ntwrk/midnight-js-contracts@^2.0.2
npm install @midnight-ntwrk/midnight-js-fetch-zk-config-provider@^2.0.2
npm install @midnight-ntwrk/midnight-js-http-client-proof-provider@^2.0.2
npm install @midnight-ntwrk/midnight-js-indexer-public-data-provider@^2.0.2
npm install @midnight-ntwrk/midnight-js-level-private-state-provider@^2.0.2
npm install @midnight-ntwrk/midnight-js-network-id@^2.0.2
npm install @midnight-ntwrk/midnight-js-types@^2.0.2
npm install @midnight-ntwrk/midnight-js-utils@^2.0.2

# Additional utilities
npm install rxjs@^7.8.1 semver@^7.6.0 fp-ts@^2.16.11 pino@^9.9.0 pino-pretty@^13.1.1 buffer@^6.0.3

# Dev dependencies
npm install --save-dev @types/semver@^7.5.8 vite-plugin-wasm@^3.5.0 vite-plugin-top-level-await@^1.6.0 vite-plugin-node-polyfills@^0.23.0

echo "Dependencies installed successfully!"
echo "Make sure you have the Midnight Lace wallet extension installed in your browser."
echo "To run the application: npm run dev"
