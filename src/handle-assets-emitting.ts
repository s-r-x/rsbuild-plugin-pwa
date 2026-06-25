import { DEFAULT_WEB_APP_MANIFEST_FILENAME } from "./config.ts";
import { genRegisterSwScript } from "./gen-register-sw-script.ts";
import type { RsBuildActionHandlerCtx } from "./types-internal.ts";
import { formatLog } from "./utils.ts";
import {
  normalizeWebAppManifest,
  serializeWebAppManifest,
} from "./web-app-manifest-utils.ts";

export function handleAssetsEmitting({
  rsbuildApi: api,
  pluginConfig: {
    webAppManifest: webAppManifestCfg,
    registerSw: registerSwCfg,
  },
  checkIfPluginDisabled,
  extractEnvBaseUrl,
  genSwUrl,
  genSwScope,
}: RsBuildActionHandlerCtx) {
  api.processAssets({ stage: "additional" }, async function (ctx) {
    if (checkIfPluginDisabled({ environmentName: ctx.environment.name })) {
      return;
    }

    const baseUrl = extractEnvBaseUrl(ctx.environment);

    await Promise.all([emitManifest(), emitRegisterSwScript()]);
    async function emitManifest() {
      if (webAppManifestCfg) {
        const manifest = await normalizeWebAppManifest(
          webAppManifestCfg.content,
          { baseUrl },
        );
        const name =
          webAppManifestCfg.filename || DEFAULT_WEB_APP_MANIFEST_FILENAME;
        const source = new ctx.sources.RawSource(
          serializeWebAppManifest(manifest, webAppManifestCfg.minify),
        );
        ctx.compilation.emitAsset(name, source, {
          minimized: true,
        });
        api.logger.debug(formatLog("web app manifest generated"));
      } else {
        api.logger.debug(formatLog("skipping web app manifest generation"));
      }
    }
    async function emitRegisterSwScript() {
      if (registerSwCfg?.type === "script") {
        const source = new ctx.sources.RawSource(
          await genRegisterSwScript({
            swUrl: genSwUrl({ environment: ctx.environment }),
            scope: genSwScope({ baseUrl }),
            features: registerSwCfg.features,
          }),
        );
        ctx.compilation.emitAsset(registerSwCfg.scriptName, source, {
          minimized: true,
        });
        api.logger.debug(formatLog("sw registration script generated"));
      }
    }
  });
}
