
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Carrega todas as variáveis de ambiente do arquivo .env
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    base: './',
    define: {
      // Mapeia a variável VITE_GEMINI_KEY (ou API_KEY) para process.env.API_KEY exigido pelo SDK
      'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_KEY || env.API_KEY || '')
    },
    server: {
      fs: {
        allow: ['.']
      }
    }
  };
});
