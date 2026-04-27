import path from "node:path";
import { createRsbuild } from "@rsbuild/core";
import {
  REG_SW_SCRIPT_COMPILED_FOLDER,
  REG_SW_SCRIPT_SRC_FOLDER,
} from "../src/config.ts";

(async function buildRegisterSwScript() {
  await Promise.all(
    ["basic", "advanced"].map(async (entry) => {
      const rsbuild = await createRsbuild({
        cwd: path.join(import.meta.dirname, ".."),
        rsbuildConfig: {
          logLevel: "error",
          source: {
            entry: {
              [entry]: path.join(REG_SW_SCRIPT_SRC_FOLDER, entry + ".ts"),
            },
          },
          tools: {
            htmlPlugin: false,
          },
          performance: {
            chunkSplit: {
              strategy: "all-in-one",
            },
          },
          output: {
            cleanDistPath: false,
            minify: entry !== "basic",
            target: "web",
            sourceMap: false,
            filename: {
              js: "[name].js",
            },
            distPath: {
              root: REG_SW_SCRIPT_COMPILED_FOLDER,
              js: "",
            },
          },
        },
      });
      await rsbuild.build();
    }),
  );
})();
