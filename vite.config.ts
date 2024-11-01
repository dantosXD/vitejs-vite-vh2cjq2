import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    define: {
      'process.env.VITE_APPWRITE_ENDPOINT': JSON.stringify(env.VITE_APPWRITE_ENDPOINT),
      'process.env.VITE_APPWRITE_PROJECT': JSON.stringify(env.VITE_APPWRITE_PROJECT),
      'process.env.VITE_APPWRITE_API_KEY': JSON.stringify(env.VITE_APPWRITE_API_KEY),
    },
  };
});