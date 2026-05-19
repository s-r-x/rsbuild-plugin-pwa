import { appTools, defineConfig } from '@modern-js/app-tools';
import { pluginPWA } from 'rsbuild-plugin-pwa';
import { SW_NAME, WEBAPP_MANIFEST_NAME } from './sw-config';

// https://modernjs.dev/en/configure/app/usage
export default defineConfig({
  builderPlugins: [
    pluginPWA({
      sw: {
        mode: 'generateSw',
        filename: SW_NAME,
      },
      webAppManifest: {
        filename: WEBAPP_MANIFEST_NAME,
      },
      registerSw: {
        type: 'virtual-module',
      },
      disabled: ctx => ctx.environmentName !== 'client',
    }),
  ],
  plugins: [appTools()],
});
