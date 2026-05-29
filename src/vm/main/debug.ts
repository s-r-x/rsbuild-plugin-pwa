import type { DebugValues } from "../types-debug.ts";

const debugValues: DebugValues = JSON.parse('"__DEBUG_VALUES"');

export function getPluginVersion(): string {
  return debugValues.pluginVersion;
}

export function getBuildDate(): string {
  return debugValues.buildDate;
}

export function getSwUrl(): string {
  return debugValues.swUrl;
}

export function getSwScope(): string {
  return debugValues.swScope;
}

export function getBaseUrl(): string {
  return debugValues.baseUrl;
}

export function getCustomDebugValues<T>(): T | null {
  return debugValues.customValues ?? null;
}

export function printDebugValues(): void {
  const customValues = getCustomDebugValues();
  const debugValues: Record<string, any> = {
    "Plugin version": getPluginVersion(),
    "Build date": getBuildDate(),
    "SW URL": getSwUrl(),
    "SW scope": getSwScope(),
    "Base url": getBaseUrl(),
  };
  if (customValues && typeof customValues === "object") {
    for (const [k, v] of Object.entries(customValues)) {
      debugValues[k] = v && typeof v === "object" ? JSON.stringify(v) : v;
    }
  }
  console.table(debugValues);
}
