import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

// Docs: https://rsbuild.rs/config/
export default defineConfig({
  plugins: [pluginReact()],
  source: {
    alias: {
      '@': './src',
      '@shared': './src/shared',
      '@core': './src/core',
      '@modules': './src/modules',
    },
  },
  html: {
    title: 'Easy English',
    favicon: './public/favicon.png',
  },
  server: {
    port: 3000,
    open: true,
  },
});
