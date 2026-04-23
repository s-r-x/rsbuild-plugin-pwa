import "./style.css";
import { useRegisterSW } from "rsbuild-plugin-pwa_vm/solid";
import { render } from 'solid-js/web';

function App() {
  useRegisterSW();
  return <div>app</div>;
}
const root = document.getElementById('root');
if (root) {
  render(() => <App />, root);
}
