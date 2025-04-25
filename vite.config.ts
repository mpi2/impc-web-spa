import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@/api-service': path.resolve(__dirname, './src/api-service/index.ts'),
      '@/components': path.resolve(__dirname, './src/components/index.ts'),
      '@/components/*': path.resolve(__dirname, './src/components/*'),
      '@/contexts': path.resolve(__dirname, './src/shared/contexts/index.ts'),
      '@/eventChannels': path.resolve(__dirname, './src/shared/eventChannels/index.ts'),
      '@/hoc/*': path.resolve(__dirname, './src/shared/high-order-components/*'),
      '@/hooks': path.resolve(__dirname, './src/shared/hooks/index.ts'),
      '@/hooks/*': path.resolve(__dirname, './src/shared/hooks/*'),
      '@/models': path.resolve(__dirname, './src/shared/models/index.ts'),
      '@/models/*': path.resolve(__dirname, './src/shared/models/*'),
      '@/shared/*': path.resolve(__dirname, './src/shared/*'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/utils': path.resolve(__dirname, './src/utils/index.tsx'),
    }
  }
})
