import { DEFAULT_WEB_APP_MANIFEST_NAME } from "./config.ts";
import type { SetRequired } from "./type-utils.ts";
import type { WebAppManifest } from "./types.ts";
import { readHostPackageJson } from "./utils.ts";

export async function normalizeWebAppManifest(
  manifest: WebAppManifest = {},
  { baseUrl }: { baseUrl: string },
): Promise<SetRequired<WebAppManifest, "name" | "scope" | "start_url">> {
  const shouldReadPkgJson = !manifest.name || !manifest.description;
  const pkgJson = shouldReadPkgJson ? await readHostPackageJson() : null;
  const {
    name = pkgJson?.name || DEFAULT_WEB_APP_MANIFEST_NAME,
    start_url = baseUrl,
    description = pkgJson?.description,
    ...baseManifest
  } = manifest;
  return {
    ...baseManifest,
    name,
    scope:
      baseManifest.scope || (baseUrl.endsWith("/") ? baseUrl : baseUrl + "/"),
    start_url,
    description,
  };
}

export function serializeWebAppManifest(
  manifest: WebAppManifest,
  minify?: boolean,
): string {
  return JSON.stringify(manifest, null, minify ? undefined : 2);
}
