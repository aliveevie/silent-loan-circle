# Silent Loan Circle CLI

A command-line interface for interacting with the Silent Loan Circle smart contract - a privacy-preserving ROSCA (Rotating Savings and Credit Association) implementation on Midnight Network.

## Features

- Deploy new Silent Loan Circle contracts
- Join existing circles
- Contribute to funding cycles
- Execute payouts
- Privacy-preserving operations using zero-knowledge proofs

## Usage

### Development

```bash
npm run testnet-remote
```

### Production

```bash
npm run build
npm start
```

## Error Fixes

This version fixes the "Expected undeployed address, got test one" error by:

1. Properly setting the network ID for testnet operations
2. Fixing address validation in deployment logic
3. Improving error handling for network mismatches
