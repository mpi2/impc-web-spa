import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from "vite-tsconfig-paths";
import { reactScopedCssPlugin } from "rollup-plugin-react-scoped-css";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths(), reactScopedCssPlugin()],
  server: {
    proxy: {
      '/proxy': {
        target: 'https://nginx.mousephenotype-dev.org/data',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy/, '')
      }
    }
  }
})
