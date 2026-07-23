import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
// @ts-expect-error This JavaScript module is shared with the Node serverless routes.
import { resolveAppUrl, resolveClientSupabaseConfig } from './config/supabaseEnvironment.js';

export default defineConfig(({ mode }) => {
  const runtimeEnvironment = loadEnv(mode, '../..', '');
  resolveClientSupabaseConfig(runtimeEnvironment, {
    allowMissingDevelopment: true,
  });
  const appUrl = resolveAppUrl(runtimeEnvironment);

  return {
    envDir: '../..',
    plugins: [react()],
    define: {
      __APP_URL__: JSON.stringify(appUrl),
    },
  };
});
