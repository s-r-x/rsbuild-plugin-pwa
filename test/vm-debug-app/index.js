import "./style.css";
import {
  getBaseUrl,
  getBuildDate,
  getPluginVersion,
  getSwScope,
  getSwUrl,
  printDebugValues,
} from "rsbuild-plugin-pwa_vm/debug";

getSwUrl();
getPluginVersion();
getBuildDate();
getSwScope();
getBaseUrl();
printDebugValues();
