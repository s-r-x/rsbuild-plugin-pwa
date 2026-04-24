import "./style.css";
import { render } from "preact";
import { useRegisterSW } from "rsbuild-plugin-pwa_vm/preact";

function App() {
  useRegisterSW();
  return <div>app</div>;
}
const root = document.getElementById("root");
if (root) {
  render(<App />, root);
}
