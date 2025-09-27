# Example BBoard - Privacy-Preserving Applications

A collection of privacy-preserving applications built on Midnight Network, showcasing zero-knowledge proof implementations and secure multi-party computation.

## Projects

### Silent Loan Circle

A privacy-preserving implementation of a Rotating Savings and Credit Association (ROSCA) using zero-knowledge proofs. Members can participate in funding cycles while maintaining complete privacy of their financial information.

#### Features
- **Privacy-First**: All contributions and member data are protected by zero-knowledge proofs
- **Trustless**: Smart contract enforcement without requiring trust in other participants
- **Fair Distribution**: Automated payout system ensures fair rotation of benefits
- **Emergency Controls**: Admin safeguards for exceptional circumstances

## Architecture

This project uses a monorepo structure with TypeScript and modern development tools:

```
example-bboard/
├── silent-loan-circle/
│   ├── contract/          # Compact smart contracts
│   ├── api/              # TypeScript API layer
│   └── silent-loan-circle-cli/  # Command-line interface
├── package.json          # Root workspace configuration
└── tsconfig.json         # TypeScript project references
```

## Getting Started

### Prerequisites
- Node.js 20+
- npm or yarn
- TypeScript 5+

### Installation

Install all dependencies:
```bash
npm install
```

Build all packages:
```bash
npm run build
```

### Usage

Navigate to the CLI directory and start:
```bash
cd silent-loan-circle/silent-loan-circle-cli
npm run testnet-remote
```

## Development

This project uses:
- **TypeScript** for type safety
- **npm workspaces** for monorepo management
- **ESM modules** for modern JavaScript
- **Conventional commits** for clear history

## License

Apache-2.0 License - see LICENSE file for details

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Commit using conventional commit format
6. Submit a pull request

## Architecture Notes

The Silent Loan Circle implements a privacy-preserving ROSCA with the following phases:

1. **Joining Phase**: Members join the circle with private commitments
2. **Active Phase**: Regular contribution cycles with zero-knowledge proofs
3. **Payout Phase**: Automated distribution to next participant
4. **Completion**: Circle completes after all members receive payouts

Privacy is maintained through:
- Zero-knowledge proofs for contribution verification
- Private state management for member data
- Commitment schemes for joining process
- Proof verification without revealing amounts
