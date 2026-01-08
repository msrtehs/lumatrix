
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Carrega as variáveis do arquivo .env ou do ambiente (GitHub Actions)
  // Use '.' em vez de process.cwd() para evitar erros de tipagem em certos ambientes
  const env = loadEnv(mode, '.', '');
  
  return {
    plugins: [react()],
    base: './', // Garante que caminhos de arquivos funcionem no subdiretório do GitHub Pages
    define: {
      // Prioriza VITE_GEMINI_KEY conforme solicitado
      'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_KEY || env.API_KEY || '')
    },
    server: {
      fs: {
        allow: ['.']
      }
    },
    build: {
      outDir: 'dist',
    }
  };
});
