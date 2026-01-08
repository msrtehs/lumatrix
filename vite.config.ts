
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Carrega variáveis de arquivos .env (local)
  const envFiles = loadEnv(mode, '.', '');
  
  // Mescla com as variáveis de ambiente reais do sistema (importante para GitHub Actions)
  const processEnv = { ...process.env, ...envFiles };
  
  // Tenta encontrar a chave em diferentes nomes possíveis para evitar erros
  const API_KEY = processEnv.VITE_GEMINI_KEY || processEnv.API_KEY || '';
  
  return {
    plugins: [react()],
    base: './',
    define: {
      // Injeta a chave no código final
      'process.env.API_KEY': JSON.stringify(API_KEY)
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
