import { render } from '@modern-js/runtime/browser';
import { createRoot } from '@modern-js/runtime/react';
import { registerSW } from 'rsbuild-plugin-pwa_vm/register-sw';

const { skipWaiting } = registerSW({
  onNewSwWaiting() {
    skipWaiting();
  },
  onNewSwActive() {
    window.location.reload();
  },
});
// Create root component
const ModernRoot = createRoot();

// Render to DOM
render(<ModernRoot />);
