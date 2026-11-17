import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command, mode }) => {
  // Usa '/OmniStudy/' SOLO se specifichiamo la modalità gh-pages, altrimenti sempre './' (per l'APK e locale)
  const isGitHubPages = mode === 'gh-pages';

  return {
    plugins: [react()],
    base: isGitHubPages ? '/OmniStudy/' : './',
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

