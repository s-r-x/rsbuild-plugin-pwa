import fs from "node:fs/promises";
import path from "node:path";
import { REG_SW_SCRIPT_COMPILED_FOLDER } from "./config.ts";
import type { DefaultRegisterSwScriptFeatures } from "./types.ts";

export async function genRegisterSwScript({
  swUrl,
  scope,
  features = {},
}: {
  swUrl: string;
  scope: string;
  features?: DefaultRegisterSwScriptFeatures;
}): Promise<string> {
  const isAdvancedScript = Object.values(features).some((feat) => feat);
  const content = await fs.readFile(
    path.join(
      REG_SW_SCRIPT_COMPILED_FOLDER,
      isAdvancedScript ? "advanced.js" : "basic.js",
    ),
    "utf8",
  );
  return content.replace(
    /__SW_URL|__SW_SCOPE|"__SCRIPT_FEATURES"/g,
    function (match) {
      switch (match) {
        case "__SW_URL":
          return swUrl;
        case "__SW_SCOPE":
          return scope;
        case '"__SCRIPT_FEATURES"':
          return JSON.stringify({
            autoReloadPage: features.autoReloadPage,
            autoSkipWaiting: features.autoSkipWaiting,
          } satisfies DefaultRegisterSwScriptFeatures);
        default:
          return match;
      }
    },
  );
}
