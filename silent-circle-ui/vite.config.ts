import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    wasm(),
    topLevelAwait(),
    nodePolyfills({
      // Enable polyfills for specific globals and modules
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      protocolImports: true,
    }),
    mode === "development" && componentTagger()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    // Fix for some Midnight SDK compatibility issues
    global: 'globalThis',
  },
  optimizeDeps: {
    // Exclude problematic Midnight packages from pre-bundling
    exclude: [
      '@midnight-ntwrk/dapp-connector-api',
      '@midnight-ntwrk/compact-runtime',
      '@midnight-ntwrk/midnight-js-indexer-public-data-provider',
      '@midnight-ntwrk/midnight-js-types',
      '@midnight-ntwrk/midnight-js-utils',
      '@midnight-ntwrk/midnight-js-fetch-zk-config-provider',
      '@midnight-ntwrk/midnight-js-http-client-proof-provider',
      '@midnight-ntwrk/midnight-js-level-private-state-provider',
      '@midnight-ntwrk/ledger',
      '@midnight-ntwrk/zswap'
    ],
    include: [
      'buffer'
    ]
  },
  build: {
    target: 'esnext',
    sourcemap: false, // Disable sourcemaps to avoid warnings from Midnight packages
    rollupOptions: {
      external: (id) => {
        // Handle WASM imports and Node.js modules properly
        return id.includes('.wasm') || 
               id.includes('level') || 
               id.includes('leveldown') ||
               id.includes('level-js');
      }
    }
  },
  css: {
    devSourcemap: false // Disable CSS sourcemaps in development
  }
}));
