import type { HtmlBasicTag } from "@rsbuild/core";
import { DEFAULT_THEME_COLOR } from "./config.ts";
import { genRegisterSwScript } from "./gen-register-sw-script.ts";
import type { RsBuildActionHandlerCtx } from "./types-internal.ts";
import { formatLog } from "./utils.ts";

export function handleHtmlInjection(ctx: RsBuildActionHandlerCtx) {
  const { pluginConfig: cfg, rsbuildApi: api } = ctx;

  api.modifyHTMLTags(async function modifyHtmlTags(tags, { environment }) {
    if (
      ctx.checkIfPluginDisabled({
        environmentName: environment.name,
      })
    ) {
      return tags;
    }

    const webAppManifestCfg = cfg.webAppManifest;
    const registerSwCfg = cfg.registerSw;
    const baseUrl = ctx.extractEnvBaseUrl(environment);

    if (registerSwCfg && registerSwCfg.type !== "virtual-module") {
      const registerSwTag: HtmlBasicTag = {
        tag: "script",
      };
      if (registerSwCfg.type === "inline") {
        registerSwTag.children = await genRegisterSwScript({
          swUrl: ctx.genSwUrl({ environment }),
          scope: ctx.genSwScope({ baseUrl }),
          features: registerSwCfg.features,
        });
      } else if (registerSwCfg.type === "script") {
        registerSwTag.attrs = {
          defer: registerSwCfg.defer,
          src: ctx.normalizeAssetUrl({
            environment,
            asset: registerSwCfg.scriptName,
          }),
        };
      }
      const tagsToMutate =
        registerSwCfg.injectTarget === "head" ? tags.headTags : tags.bodyTags;
      if (registerSwCfg.injectPosition === "start") {
        tagsToMutate.unshift(registerSwTag);
      } else {
        tagsToMutate.push(registerSwTag);
      }
      api.logger.debug(formatLog("register sw script added to the html"));
    }

    if (
      cfg.htmlTags?.themeColor &&
      !tags.headTags.some(
        ({ tag, attrs }) => tag === "meta" && attrs?.name === "theme-color",
      )
    ) {
      const themeColor = cfg.htmlTags.themeColor;
      tags.headTags.unshift({
        tag: "meta",
        attrs: {
          name: "theme-color",
          content: (typeof themeColor === "string"
            ? themeColor
            : (webAppManifestCfg !== false &&
                webAppManifestCfg.content?.theme_color) ||
              DEFAULT_THEME_COLOR) satisfies string,
        },
      });
    }
    if (
      cfg.htmlTags?.appleTouchIcon?.href &&
      !tags.headTags.some(
        ({ tag, attrs }) => tag === "link" && attrs?.rel === "apple-touch-icon",
      )
    ) {
      tags.headTags.unshift({
        tag: "link",
        attrs: {
          ...cfg.htmlTags.appleTouchIcon,
          rel: "apple-touch-icon",
        },
      });
    }
    if (cfg.htmlTags?.icon) {
      const icons = Array.isArray(cfg.htmlTags.icon)
        ? cfg.htmlTags.icon
        : [cfg.htmlTags.icon];
      for (const icon of icons) {
        tags.headTags.unshift({
          tag: "link",
          attrs: {
            ...icon,
            rel: "icon",
          },
        });
      }
    }
    if (webAppManifestCfg && !webAppManifestCfg.skipHtmlInjection) {
      tags.headTags.unshift({
        tag: "link",
        attrs: {
          rel: "manifest",
          href: ctx.genWebAppManifestUrl({
            environment,
            filename: webAppManifestCfg.filename,
          }),
        },
      });
      api.logger.debug(formatLog("link to web app manifest added to the html"));
    }

    return tags;
  });
}
