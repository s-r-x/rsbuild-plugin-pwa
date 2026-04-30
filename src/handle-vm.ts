import fs from "node:fs/promises";
import path from "node:path";
import {
  VM_COMPILED_FOLDER,
  VM_COMPILED_FOLDER_MOCK,
  VM_LIST,
  VM_MOD_BASE_NAME,
} from "./config.ts";
import type { RsBuildActionHandlerCtx } from "./types-internal.ts";
import { formatLog } from "./utils.ts";

export function handleVirtualModules(ctx: RsBuildActionHandlerCtx) {
  const { rsbuildApi: api, pluginConfig: cfg } = ctx;
  // rspack vm plugin doesn't work out of the box
  // 1. we need to initialize rspack vm plugin with a map in format { fake path -> empty string (or something else, it doesn't matter, cause they're ignored anyway) }
  // 2. update rspack resolve aliases with a map { import name (e.g. rsbuild-plugin-pwa-virtual/register-sw) -> fake path }
  // 3. intercept those fake paths imports using api.transform and return the real module's code from there

  const vmPluginEntries: Record<string, string> = {};
  const rspackResolveAliasEntries: Record<string, string> = {};
  for (const moduleName of VM_LIST) {
    const importName = VM_MOD_BASE_NAME + "/" + moduleName;
    const realPath = path.join(
      api.context.action === "dev" && !cfg.dev
        ? VM_COMPILED_FOLDER_MOCK
        : VM_COMPILED_FOLDER,
      moduleName + ".js",
    );
    const fakePath = path.join(
      path.join(api.context.rootPath, ".rsbuild-pwa-virtual-module"),
      VM_MOD_BASE_NAME + "/" + moduleName + ".js",
    );
    vmPluginEntries[fakePath] = "";
    rspackResolveAliasEntries[importName] = fakePath;
    // it looks like this transform thing works only when called synchronously in "setup" cb
    // cause it does nothing inside modifyRspackConfig cb
    api.transform(
      {
        test: fakePath,
      },
      async function transformVirtualModule(transformCtx) {
        const content = await fs.readFile(realPath, "utf8");
        return content.replace(/__SW_URL|__SW_SCOPE/g, function (match) {
          const baseUrl = ctx.extractEnvBaseUrl(transformCtx.environment);
          switch (match) {
            case "__SW_URL":
              return ctx.genSwUrl({ environment: transformCtx.environment });
            case "__SW_SCOPE":
              return ctx.genSwScope({ baseUrl });
            default:
              return match;
          }
        });
      },
    );
  }

  api.modifyRspackConfig(function modifyRspackCfg(rspackCfg, utils) {
    if (utils.environment.config.output.target === "web-worker") {
      return;
    }

    rspackCfg.plugins.push(
      new utils.rspack.experiments.VirtualModulesPlugin(vmPluginEntries),
    );
    const newRspackCfg = utils.mergeConfig(rspackCfg, {
      resolve: {
        alias: rspackResolveAliasEntries,
      },
    });
    api.logger.debug(formatLog("virtual modules initialized"));
    return newRspackCfg;
  });
}
