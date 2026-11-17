import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command, mode }) => {
  // Se stiamo compilando specificamente per GitHub Pages, usiamo il path del repo
  // Altrimenti (per l'app mobile o sviluppo locale) usiamo './'
  const isGitHubPages = mode === 'gh-pages' || process.env.GITHUB_ACTIONS === 'true';

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

