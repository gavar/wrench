import { builtinModules } from "module";
import path from "path";
import cleanup from "rollup-plugin-cleanup";
import dts from "rollup-plugin-dts";
import resolve from "rollup-plugin-node-resolve";
import ts2 from "rollup-plugin-typescript2";
import { CompilerOptions } from "typescript";
import { collectBinFiles, createBinFileConfig } from "./bin";
import { merge } from "./merge";
import { dtsPretty } from "./plugins";
import { Context, Package, RollupConfig } from "./types";
import { defaultDirectories, isUnderWorkingDirectory, resolveThrow, scriptFileTypes } from "./util";

const clear = require("rollup-plugin-clear");

/**
 * Create {@link RollupConfig} to bundle a NodeJS library.
 * @param pack - package describing library.
 * @param base - base configurations to extend if any.
 */
export function nodejs(pack: Package, base?: RollupConfig): RollupConfig[] {
  const dir = Object.assign({}, defaultDirectories(pack), pack.directories);
  const basename = pack.main && path.basename(pack.main) || "index";

  const output = path.join(dir.lib, basename);
  const input = resolveThrow(dir.src, basename);

  const context: Context = {
    directories: dir,
    rts2Cache: path.join(dir.tmp, "./.rts2_cache"),
    external: [
      pack.name, // allow to import itself
      builtinModules,
      Object.keys(pack.dependencies || []),
      Object.keys(pack.peerDependencies || []),
    ].flat(),
    resolve: {preferBuiltins: true},
  };

  /** Temporary cache for the declarations output, to avoid output pollution. */
  const declarationDir = path.join(dir.tmp, "./.dts");

  /** Generate bundles from input. */
  const tsConfig = merge(base, {
    input,
    output: [
      { // CommonJS
        file: output + ".js",
        format: "cjs",
        sourcemap: true,
        esModule: false, // NodeJS does not require to define __esModule
        preferConst: true, // NodeJS supports `const` since early versions
        strict: false, // NodeJS modules are strict by default
      },
      { // ECMAScript
        file: output + ".mjs",
        format: "esm",
        sourcemap: true,
      },
    ],
    external: context.external,
    plugins: [
      // prevent accidentally removing working directory
      clear({targets: [dir.tmp, dir.lib].filter(isUnderWorkingDirectory)}),
      resolve(context.resolve),
      ts2({
        cacheRoot: context.rts2Cache,
        useTsconfigDeclarationDir: true,
        tsconfigOverride: {
          files: [input],
          compilerOptions: {
            outDir: dir.lib,
            declarationDir,
            declarationMap: false,
          } as CompilerOptions,
        },
      }),
      cleanup({
        comments: ["sources"],
        extensions: [...scriptFileTypes],
      }),
    ],
  });

  /** Generates `.d.ts` bundle from the the previous output. */
  const dtsConfig: RollupConfig = {
    input: path.join(declarationDir, basename + ".d.ts"),
    plugins: [
      dts(),
      dtsPretty(),
    ],
    output: {file: pack.types || `${output}.d.ts`, format: "esm"},
    external: context.external,
  };

  /** Generates bundle for each executable script. */
  const binConfigs = collectBinFiles(pack, context)
    .map(file => createBinFileConfig(file, pack, context));

  return [
    tsConfig,
    dtsConfig,
    ...binConfigs,
  ];
}
