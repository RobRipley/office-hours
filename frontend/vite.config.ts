import { fileURLToPath, URL } from 'url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import environment from 'vite-plugin-environment';

// Local development defaults
const DFX_NETWORK = process.env.DFX_NETWORK || 'local';
const LOCAL_II_CANISTER = 'rdmx6-jaaaa-aaaaa-aaadq-cai';

const II_URL = DFX_NETWORK === 'local'
  ? `http://${LOCAL_II_CANISTER}.localhost:4943`
  : 'https://identity.internetcomputer.org';

export default defineConfig({
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:4943',
        changeOrigin: true,
      },
    },
  },
  plugins: [
    react(),
    environment('all', { prefix: 'CANISTER_' }),
    environment('all', { prefix: 'DFX_' }),
    environment(['II_URL'], { defineOn: 'import.meta.env', default: II_URL }),
  ],
  define: {
    'process.env.II_URL': JSON.stringify(II_URL),
    'process.env.DFX_NETWORK': JSON.stringify(DFX_NETWORK),
  },
  resolve: {
    alias: [
      {
        find: 'declarations',
        replacement: fileURLToPath(new URL('../src/declarations', import.meta.url)),
      },
      {
        find: '@',
        replacement: fileURLToPath(new URL('./src', import.meta.url)),
      },
    ],
    dedupe: ['@dfinity/agent'],
  },
});
