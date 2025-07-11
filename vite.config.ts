import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tsconfigPaths from "vite-tsconfig-paths";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  base: "/impc-web-spa/",
  plugins: [
    react(),
    tsconfigPaths(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        maximumFileSizeToCacheInBytes: 10000000,
      },
    }),
  ],
  server: {
    proxy: {
      "/proxy": {
        target: "https://nginx.mousephenotype-dev.org/data",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy/, ""),
      },
    },
  },
  build: {
    outDir: "public",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: [
            "react",
            "react-dom",
            "lodash",
            "moment",
            "framer-motion",
            "classnames",
            "file-saver",
            "react-router",
          ],
          chartjs: [
            "react-chartjs-2",
            "chart.js",
            "chartjs-adapter-moment",
            "chartjs-chart-error-bars",
            "chartjs-plugin-datalabels",
            "chartjs-plugin-zoom",
            "@sgratzl/chartjs-chart-boxplot",
          ],
          nivo: ["@nivo/axes", "@nivo/core", "@nivo/heatmap"],
          visx: ["@visx/visx"],
          d3: ["d3"],
          upsetjs: ["@upsetjs/react"],
          bootstrap: ["bootstrap", "react-bootstrap"],
        },
      },
    },
  },
  publicDir: "assets",
});
