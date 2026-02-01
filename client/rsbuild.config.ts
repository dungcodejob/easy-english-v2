import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { tanstackRouter } from '@tanstack/router-plugin/rspack';

// Docs: https://rsbuild.rs/config/
export default defineConfig({
  plugins: [pluginReact()],
  tools: {
    rspack: {
      plugins: [
        tanstackRouter({
          target: 'react',
          virtualRouteConfig: './src/routes.ts',
          routesDirectory: './src',
          autoCodeSplitting: true,
        }),
      ],
    },
  },
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
