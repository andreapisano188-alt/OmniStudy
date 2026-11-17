import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command, mode }) => {
  return {
    plugins: [react()],
    // Rileva automaticamente GitHub Actions e imposta il percorso corretto
    base: process.env.GITHUB_ACTIONS ? '/OmniStudy/' : './',
    server: {
      port: 3000,
      host: true
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false
    }
  };
});
