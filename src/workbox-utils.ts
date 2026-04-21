export function genWbModifyUrlPrefix(prefix: string) {
  return {
    "": prefix.endsWith("/") ? prefix : prefix + "/",
  };
}
