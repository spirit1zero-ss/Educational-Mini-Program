import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    base: './',
    plugins: [react()],
    build: {
      outDir: 'src/CRMEB/CRMEB-master/crmeb/public/h5',
      emptyOutDir: true
    },
    server: {
      proxy: {
        '/api': {
          target: env.VITE_CRMEB_API_ORIGIN || 'http://127.0.0.1:8080',
          changeOrigin: true
        }
      }
    }
  };
});
