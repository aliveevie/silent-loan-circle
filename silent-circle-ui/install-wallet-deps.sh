#!/bin/bash

# Installation script for Midnight Lace wallet dependencies
echo "Installing Midnight Lace wallet dependencies..."

npm install @midnight-ntwrk/dapp-connector-api@^1.0.0 rxjs@^7.8.1 semver@^7.6.0
npm install --save-dev @types/semver@^7.5.8

echo "Dependencies installed successfully!"
echo "Make sure you have the Midnight Lace wallet extension installed in your browser."
echo "To run the application: npm run dev"
