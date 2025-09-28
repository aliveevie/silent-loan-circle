#!/bin/bash

# Simple installation script for wallet connection
echo "Installing essential packages for Lace wallet connection..."

# Only the essential packages
npm install @midnight-ntwrk/dapp-connector-api@^3.0.0
npm install @midnight-ntwrk/compact-runtime@^0.8.1

# Basic utilities
npm install rxjs@^7.8.1
npm install pino@^9.9.0
npm install pino-pretty@^13.1.1
npm install buffer@^6.0.3

# Basic dev dependencies for Vite
npm install --save-dev vite-plugin-wasm@^3.5.0 vite-plugin-top-level-await@^1.6.0 vite-plugin-node-polyfills@^0.23.0

echo "✅ Essential dependencies installed!"
echo "🔗 Make sure you have the Midnight Lace wallet extension installed in your browser."
echo "🚀 To run: npm run dev"