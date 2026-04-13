import assert from "node:assert";
import crypto from "node:crypto";
import os from "node:os";
import path from "node:path";
import { createRsbuild } from "@rsbuild/core";

export async function buildCustomSw({
  rootFolder,
  swSrc,
  minify,
}: {
  rootFolder: string;
  swSrc: string;
  minify: boolean;
}): Promise<{ swDest: string; destDir: string }> {
  const tempDir = path.join(
    os.tmpdir(),
    "rsbuild-plugin-pwa-sw-build-" +
      crypto.randomBytes(8).toString("base64url"),
  );
  const rsbuild = await createRsbuild({
    cwd: rootFolder,
    rsbuildConfig: {
      mode: "production",
      dev: {},
      logLevel: "error",
      environments: {
        sw: {
          performance: {
            chunkSplit: {
              strategy: "all-in-one",
            },
          },
          source: {
            entry: {
              sw: path.isAbsolute(swSrc)
                ? swSrc
                : path.resolve(rootFolder, swSrc),
            },
          },
          tools: {
            htmlPlugin: false,
          },
          output: {
            minify,
            target: "web-worker",
            sourceMap: false,
            filename: {
              js: "[name].js",
            },
            distPath: {
              root: tempDir,
            },
          },
        },
      },
    },
  });
  const buildResult = await rsbuild.build();
  const buildStats = buildResult.stats?.toJson({
    assets: true,
    outputPath: true,
  });
  const buildAssets = buildStats?.assets;
  assert(buildStats?.outputPath, "rsbuild output path is not defined");
  assert(buildAssets?.length, "rsbuild build assets are empty");
  return {
    destDir: tempDir,
    swDest: path.join(buildStats.outputPath, buildAssets[0].name),
  };
}
