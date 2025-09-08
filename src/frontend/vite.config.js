import { fileURLToPath, URL } from 'url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import environment from 'vite-plugin-environment';
import dotenv from 'dotenv';
import tailwindcss from '@tailwindcss/vite'


// Load network-specific env first if present, then fallback to .env
const network = process.env.DFX_NETWORK || (process.env.NODE_ENV === 'production' ? 'ic' : 'local');
dotenv.config({ path: `../../.env.${network}` });
dotenv.config({ path: '../../.env' });

export default defineConfig({
  css: {
    // Ensure css config object exists for Tailwind Vite plugin compatibility
    devSourcemap: false,
  },
  build: {
    emptyOutDir: true,
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:4943",
        changeOrigin: true,
      },
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    environment("all", { prefix: "CANISTER_" }),
    environment("all", { prefix: "DFX_" }),
  ],
  resolve: {
    alias: [
      {
        find: "declarations",
        replacement: fileURLToPath(
          new URL("../declarations", import.meta.url)
        ),
      },
      {
        find: 'react/jsx-runtime',
        replacement: fileURLToPath(new URL('../../node_modules/react/jsx-runtime.js', import.meta.url)),
      },
      {
        find: 'react/jsx-dev-runtime',
        replacement: fileURLToPath(new URL('../../node_modules/react/jsx-dev-runtime.js', import.meta.url)),
      },
      {
        find: 'react-dom/client',
        replacement: fileURLToPath(new URL('../../node_modules/react-dom/client.js', import.meta.url)),
      },
      // Ensure React resolves from the monorepo root when hoisted
      {
        find: 'react',
        replacement: fileURLToPath(new URL('../../node_modules/react/index.js', import.meta.url)),
      },
      {
        find: 'react-dom',
        replacement: fileURLToPath(new URL('../../node_modules/react-dom/index.js', import.meta.url)),
      },
    ],
    dedupe: ['@dfinity/agent'],
  },
});
