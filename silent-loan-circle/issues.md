macbookair@MacBooks-MacBook-Air scaffold-midnight % npm run faucet

> witness@0.1.0 faucet
> node boilerplate/scripts/request-faucet.js

node:internal/modules/esm/resolve:275
    throw new ERR_MODULE_NOT_FOUND(
          ^

Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/Users/macbookair/example-bboard/silent-loan-circle/scaffold-midnight/node_modules/@midnight-ntwrk/zswap/snippets/midnight-zswap-wasm-41bcd0561f7a9007/inline0.js' imported from /Users/macbookair/example-bboard/silent-loan-circle/scaffold-midnight/node_modules/@midnight-ntwrk/zswap/midnight_zswap_wasm_fs.js
    at finalizeResolution (node:internal/modules/esm/resolve:275:11)
    at moduleResolve (node:internal/modules/esm/resolve:860:10)
    at defaultResolve (node:internal/modules/esm/resolve:984:11)
    at ModuleLoader.defaultResolve (node:internal/modules/esm/loader:780:12)
    at #cachedDefaultResolve (node:internal/modules/esm/loader:704:25)
    at ModuleLoader.resolve (node:internal/modules/esm/loader:687:38)
    at ModuleLoader.getModuleJobForImport (node:internal/modules/esm/loader:305:38)
    at ModuleJob._link (node:internal/modules/esm/module_job:137:49) {
  code: 'ERR_MODULE_NOT_FOUND',
  url: 'file:///Users/macbookair/example-bboard/silent-loan-circle/scaffold-midnight/node_modules/@midnight-ntwrk/zswap/snippets/midnight-zswap-wasm-41bcd0561f7a9007/inline0.js'
}

🎉 Successfully synced 1 contract file(s) from root to contract/src/
🔍 Auto-detected contract file: my-contract.compact
📋 Found 2 functions and 1 state variables
🔨 Compiling contract...
❌ Generation failed: Error: Command failed with exit code 255: compactc /Users/macbookair/example-bboard/silent-loan-circle/scaffold-midnight/boilerplate/contract/src/my-contract.compact /Users/macbookair/example-bboard/silent-loan-circle/scaffold-midnight/boilerplate/contract/src/managed/my-contract
    at ChildProcess.<anonymous> (file:///Users/macbookair/example-bboard/silent-loan-circle/scaffold-midnight/boilerplate/scripts/auto-generator.js:527:18)
    at ChildProcess.emit (node:events:507:28)
    at maybeClose (node:internal/child_process:1101:16)
    at Socket.<anonymous> (node:internal/child_process:457:11)
    at Socket.emit (node:events:507:28)
    at Pipe.<anonymous> (node:net:351:12)
✅ Auto-generation complete!
✅ Compiling contract and generating CLI completed successfully

🔄 Connecting to testnet and deploying contract...
📍 Running: npm run testnet-remote
📁 Working directory: /Users/macbookair/example-bboard/silent-loan-circle/scaffold-midnight/boilerplate/contract-cli

> @midnight-ntwrk/counter-cli@0.1.0 testnet-remote
> node --experimental-specifier-resolution=node --loader ts-node/esm src/testnet-remote.ts

(node:78752) ExperimentalWarning: `--experimental-loader` may be removed in the future; instead use `register()`:
--import 'data:text/javascript,import { register } from "node:module"; import { pathToFileURL } from "node:url"; register("ts-node/esm", pathToFileURL("./"));'
(Use `node --trace-warnings ...` to show where the warning was created)
(node:78752) [DEP0180] DeprecationWarning: fs.Stats constructor is deprecated.
(Use `node --trace-deprecation ...` to show where the warning was created)

node:internal/modules/run_main:104
    triggerUncaughtException(
    ^
[Object: null prototype] {
  [Symbol(nodejs.util.inspect.custom)]: [Function: [nodejs.util.inspect.custom]]
}

Node.js v23.11.1
npm error Lifecycle script `testnet-remote` failed with error:
npm error code 1
npm error path /Users/macbookair/example-bboard/silent-loan-circle/scaffold-midnight/boilerplate/contract-cli
npm error workspace @midnight-ntwrk/counter-cli@0.1.0
npm error location /Users/macbookair/example-bboard/silent-loan-circle/scaffold-midnight/boilerplate/contract-cli
npm error command failed
npm error command sh -c node --experimental-specifier-resolution=node --loader ts-node/esm src/testnet-remote.ts
❌ Connecting to testnet and deploying contract failed with code 1

❌ Deployment failed: Connecting to testnet and deploying contract failed

🔧 Troubleshooting:
   - Check your testnet connection
   - Verify your wallet has sufficient testnet balance
   - Check that your .compact contract file exists
   - Verify npm dependencies are installed
   - Ensure WALLET_SEED is set in .env file (or will be prompted)

npm run dev with the bboard-ui is just showing a blank