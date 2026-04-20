import fs from "node:fs/promises";
import path from "node:path";
import { VM_LIST, VM_MOD_BASE_NAME } from "../src/config.ts";

(async function buildVmTypes() {
  const dir = import.meta.dirname;
  const dstDir = path.join(dir, "..", "types");
  await fs.rm(dstDir, { recursive: true, force: true });
  await fs.mkdir(dstDir, { recursive: true });

  await Promise.all(
    VM_LIST.map(async function (vmName) {
      const content = await fs
        .readFile(path.join(dir, "vm-types", vmName + ".ts"), "utf8")
        .then(function (content) {
          return content.replace(
            /__MODULE_NAME|__DTS_PATH|\/\/ @ts-nocheck/g,
            function (match) {
              switch (match) {
                case "__MODULE_NAME":
                  return VM_MOD_BASE_NAME + "/" + vmName;
                case "__DTS_PATH":
                  return "../vm-dist/main/" + vmName;
                case "// @ts-nocheck":
                  return "";
              }
              return match;
            },
          );
        });
      await fs.writeFile(path.join(dstDir, vmName + ".d.ts"), content);
    }),
  );
})();
