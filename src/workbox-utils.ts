export function genWbModifyUrlPrefix(baseUrl: string) {
  return {
    // prepend baseUrl to every url
    "": baseUrl.endsWith("/") ? baseUrl : baseUrl + "/",
  };
}
