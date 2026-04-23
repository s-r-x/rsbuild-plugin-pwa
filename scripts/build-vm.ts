import path from "node:path";
import { createRslib } from "@rslib/core";
import {
  VM_COMPILED_FOLDER,
  VM_COMPILED_FOLDER_MOCK,
  VM_LIST,
  VM_SRC_FOLDER,
  VM_SRC_FOLDER_MOCK,
} from "../src/config.ts";

(async function buildVm() {
  await Promise.all(
    [
      { src: VM_SRC_FOLDER, dst: VM_COMPILED_FOLDER, dts: true },
      { src: VM_SRC_FOLDER_MOCK, dst: VM_COMPILED_FOLDER_MOCK },
    ].flatMap(function ({ src: baseSrc, dst, dts }) {
      return VM_LIST.map(async function (entry) {
        const src = path.join(baseSrc, entry + ".ts");
        const rslib = await createRslib({
          cwd: path.join(import.meta.dirname, ".."),
          config: {
            lib: [
              {
                source: {
                  entry: { [entry]: src },
                },
                format: "esm",
                syntax: "esnext",
                dts: dts ? { bundle: true } : false,
                output: {
                  target: "web",
                  externals: [
                    "workbox-window",
                    "react",
                    "vue",
                    "svelte",
                    "svelte/store",
                    "solid-js",
                  ],
                  distPath: {
                    root: dst,
                  },
                },
              },
            ],
            performance: {
              chunkSplit: {
                strategy: "all-in-one",
              },
            },
          },
        });
        return rslib.build();
      });
    }),
  );
})();
