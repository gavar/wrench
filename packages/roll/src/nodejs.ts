import { typescript, typescriptDts } from "@wrench/roll-typescript";
import { identity } from "lodash";
import { builtinModules } from "module";
import path from "path";
import { OutputOptions } from "rollup";
import cleanup from "rollup-plugin-cleanup-chunk";
import clear from "rollup-plugin-clear";
import { CompilerOptions } from "typescript";
import { collectBinFiles, createBinConfig } from "./bin";
import { Context, Package, RollupConfig } from "./types";
import {
  defaultPackageDirectories,
  dirname,
  extname,
  isSubPathOfWorkingDirectory,
  merge,
  output,
  resolve,
} from "./util";

export interface PackInfo {
  path: string;
  pack?: Package;
}

/**
 * Create {@link RollupConfig} to bundle a NodeJS library.
 * @param path - path to a `package.json` file.
 * @param base - base configurations to extend.
 */
export function nodejs(path?: string, base?: RollupConfig): RollupConfig[];

/**
 * Create {@link RollupConfig} to bundle a NodeJS library.
 * @param info - `package.json` location and content.
 * @param base - base configurations to extend.
 */
export function nodejs(info: PackInfo, base?: RollupConfig): RollupConfig[];

/** @internal */
export function nodejs(info: string | PackInfo, base: RollupConfig = {}): RollupConfig[] {
  // resolve
  info = normalizePackInfo(info);

  // load package.json
  if (!info.pack) {
    console.log("loading package:", info.path);
    info.pack = require(info.path);
  }

  // avoid mutating original package.json
  info.pack = {...info.pack};

  // verify
  const {pack} = info;
  if (!pack.main) throw new Error("package 'main' field is required");

  const dir = pack.directories = Object.assign({}, defaultPackageDirectories(pack), pack.directories);
  const rel = path.relative(dir.lib, pack.main);
  const entry = rel.slice(0, -extname(rel).length);
  const input = resolve(dir.src, rel);

  const external: string[] = [
    builtinModules,
    pack.dependencies && Object.keys(pack.dependencies),
    pack.peerDependencies && Object.keys(pack.peerDependencies),
  ].filter(identity).flat();

  const modular = base.preserveModules;
  const context: Context = {
    modular,
    directories: dir,
    external,
    cleanup: {
      transform: false,
      renderChunk: true,
      comments: "none",
      compactComments: true,
      maxEmptyLines: 1,
      sourcemap: true,
      extensions: ["js", "jsx", "ts", "tsx"],
    },
  };

  /** CommonJS bundle output options. */
  const cjs = output(pack.main, modular, {
    format: "cjs",
    sourcemap: true,
    esModule: false, // NodeJS does not require to define __esModule
    preferConst: true, // NodeJS supports `const` since early versions
    strict: false, // NodeJS modules are strict by default
  });

  /** ECMAScript bundle output options. */
  const esm: OutputOptions = pack.module && output(pack.module, modular, {
    format: "esm",
    sourcemap: true,
  });

  /** TypeScript compiler options.  */
  const compilerOptions: CompilerOptions = {
    outDir: path.join(dir.tmp, ".ts"),
    declarationDir: path.join(dir.tmp, ".dts"),
    rootDir: dir.src,
  };

  // configure staging directory for type definitions
  if (pack.types) {
    compilerOptions.declaration = true;
    compilerOptions.removeComments = false;
    if (modular) {
      compilerOptions.declarationDir = path.join(dirname(pack.types) || pack.types);
    } else {
      compilerOptions.declarationMap = false;
    }
  }

  /** Generates `.d.ts` bundle from the the previous output. */
  let dtsConfig: RollupConfig;
  if (!modular && pack.types) {
    dtsConfig = {
      input: path.join(compilerOptions.declarationDir, entry + ".d.ts"),
      output: {
        file: path.normalize(pack.types),
        format: "esm",
      },
      plugins: [typescriptDts()],
      external,
    };
  }

  /** Generate bundles from input. */
  const tsConfig = merge(base, {
    input,
    output: [cjs, esm].filter(identity),
    external,
    plugins: [
      clear({
        targets: [
          dir.tmp,
          dirname(pack.main) || pack.main,
          dirname(pack.types) || pack.types,
          dirname(pack.module) || pack.module,
        ].filter(isSafeToDelete),
      }),
      typescript({
        compilerOptions,
        types: !modular && pack.types,
      }),
      cleanup(context.cleanup),
    ],
  });

  /** Generates bundle for each executable script. */
  const binConfigs = collectBinFiles(pack, context)
    .map(x => createBinConfig(x, info as PackInfo, context));

  // `rollup` will run this configurations in sequence
  return [
    tsConfig,
    // dtsConfig,
    ...binConfigs,
  ].filter(identity);
}

function isSafeToDelete(p: string) {
  // TODO: better guard from removing any of the source code
  return isSubPathOfWorkingDirectory(p);
}

function normalizePackInfo(info: string | PackInfo): PackInfo {
  if (info && typeof info === "object")
    return {...info};

  return {
    path: info as string || path.resolve("package.json"),
  };
}
