  /// <reference types="../../types/svelte.d.ts" />
import { mount } from 'svelte';
import App from './App.svelte';
import './style.css';

const app = mount(App, {
  target: document.body,
  props: {
    tool: 'Rsbuild',
    framework: 'Svelte',
  },
});

export default app;
