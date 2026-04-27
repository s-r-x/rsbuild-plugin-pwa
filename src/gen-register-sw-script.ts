import fs from "node:fs/promises";
import path from "node:path";
import { REG_SW_SCRIPT_COMPILED_FOLDER } from "./config.ts";

export async function genRegisterSwScript({
  swUrl,
  scope,
}: {
  swUrl: string;
  scope: string;
}): Promise<string> {
  const content = await fs.readFile(
    path.join(REG_SW_SCRIPT_COMPILED_FOLDER, "basic.js"),
    "utf8",
  );
  return content.replace(/__SW_URL|__SW_SCOPE/g, function (match) {
    switch (match) {
      case "__SW_URL":
        return swUrl;
      case "__SW_SCOPE":
        return scope;
      default:
        return match;
    }
  });
}
