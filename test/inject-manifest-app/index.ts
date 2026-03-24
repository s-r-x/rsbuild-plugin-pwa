import "./style.css";

(async function execLib() {
  const { lib } = await import(/* webpackChunkName: "lib" */ "./lib");
  lib();
})();
(async function loadJson() {
  {
    const jsonUrl = new URL("./data.json", import.meta.url).href;
    const response = await fetch(jsonUrl);
    const json = await response.json();
    console.log(json);
  }
})();
