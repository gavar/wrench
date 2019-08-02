import { builtinModules } from "module";
import path from "path";
import { OutputOptions } from "rollup";
import cleanup from "rollup-plugin-cleanup";
import clear from "rollup-plugin-clear";
import resolve from "rollup-plugin-node-resolve";
import ts2 from "rollup-plugin-typescript2";
import slash from "slash";
import { CompilerOptions } from "typescript";
import { collectBinFiles, createBinFileConfig } from "./bin";
import { dtsBundleGenerator, dtsPretty } from "./plugins";
import { merge } from "./util";
import { Context, Package, RollupConfig } from "./types";
import { defaultDirectories, isUnderWorkingDirectory, resolveThrow, scriptFileTypes } from "./util";

/**
 * Create {@link RollupConfig} to bundle a NodeJS library.
 * @param pack - package describing library.
 * @param base - base configurations to extend if any.
 */
export function nodejs(pack: Package, base?: RollupConfig): RollupConfig[] {
  // verify
  if (!pack.main) throw new Error("package 'main' field is required");

  // `main` might contain double extension like: lib/index.cjs.js
  const main = slash(pack.main);
  const ext = main.slice(main.indexOf(".", main.lastIndexOf("/") || 0));
  const basename = path.basename(main, ext);
  const dir = Object.assign({}, defaultDirectories(pack), pack.directories);
  const input = resolveThrow(dir.src, basename);

  const external: string[] = [
    builtinModules,
    pack.dependencies && Object.keys(pack.dependencies),
    pack.peerDependencies && Object.keys(pack.peerDependencies),
  ].filter(identity).flat();

  const context: Context = {
    directories: dir,
    rts2Cache: path.join(dir.tmp, "./.rts2_cache"),
    resolve: {preferBuiltins: true},
    external,
  };

  /** CommonJS bundle output options. */
  const cjs: OutputOptions = {
    file: pack.main,
    format: "cjs",
    sourcemap: true,
    esModule: false, // NodeJS does not require to define __esModule
    preferConst: true, // NodeJS supports `const` since early versions
    strict: false, // NodeJS modules are strict by default
  };

  /** ECMAScript bundle output options. */
  const esm: OutputOptions = pack.module && {
    file: pack.module,
    format: "esm",
    sourcemap: true,
  };

  /** TypeScript compiler options.  */
  const compilerOptions: CompilerOptions = {
    outDir: dir.lib,
  };

  // configure staging directory for type definitions if required
  if (pack.types) {
    compilerOptions.declaration = true;
    compilerOptions.declarationDir = path.join(dir.tmp, "./.dts");
    compilerOptions.declarationMap = false;
  }

  /** Generate bundles from input. */
  const tsConfig = merge(base, {
    input,
    output: [cjs, esm].filter(identity),
    external,
    plugins: [
      // prevent accidentally removing working directory
      clear({targets: [dir.tmp, dir.lib].filter(isUnderWorkingDirectory)}),
      resolve(context.resolve),
      ts2({
        cacheRoot: context.rts2Cache,
        useTsconfigDeclarationDir: true,
        tsconfigOverride: {
          files: [input],
          compilerOptions,
        },
      }),
      cleanup({
        comments: ["sources"],
        extensions: [...scriptFileTypes],
      }),
    ],
  });

  /** Generates `.d.ts` bundle from the the previous output. */
  const dtsConfig: RollupConfig = pack.types && {
    input: path.join(compilerOptions.declarationDir, basename + ".d.ts"),
    plugins: [
      dtsBundleGenerator({external}),
      dtsPretty(),
    ],
    output: {file: pack.types, format: "esm"},
    external,
  };

  /** Generates bundle for each executable script. */
  const binConfigs = collectBinFiles(pack, context)
    .map(file => createBinFileConfig(file, pack, context));

  // `rollup` will run this configurations in sequence
  return [
    tsConfig,
    dtsConfig,
    ...binConfigs,
  ].filter(identity);
}

function identity<T>(x: T) {
  return x;
}
