import "./style.css";
import { createRoot } from "react-dom/client";
import { useRegisterSW } from "rsbuild-plugin-pwa_vm/react";

function App() {
  useRegisterSW();
  return <div>app</div>;
}
const $root = document.getElementById("root");
const root = createRoot($root);
root.render(<App />);
