import { typescript, typescriptDts } from "@wrench/roll-typescript";
import Module from "module";
import path from "path";
import { InputOptions, OutputOptions } from "rollup";
import cleanup from "rollup-plugin-cleanup-chunk";
import clear from "rollup-plugin-clear";
import { CompilerOptions, ScriptTarget } from "typescript";
import { collectBinFiles, createBinConfig } from "./bin";
import { Context, Package, RollupConfig } from "./types";
import {
  defaultPackageDirectories,
  dirname,
  extname,
  isSubPathOfWorkingDirectory,
  output,
  resolve,
  slash,
} from "./util";

export interface PackInfo {
  path: string;
  pack?: Package;
}

/**
 * Create {@link RollupConfig} to bundle a NodeJS library.
 * @param path - path to a `package.json` file.
 * @param input - base input options.
 * @param output - base output options.
 */
export function nodejs(path?: string, input?: InputOptions, output?: OutputOptions): RollupConfig[];

/**
 * Create {@link RollupConfig} to bundle a NodeJS library.
 * @param info - `package.json` location and content.
 * @param input - base input options.
 * @param output - base output options.
 */
export function nodejs(info: PackInfo, input?: InputOptions, output?: OutputOptions): RollupConfig[];

/** @internal */
export function nodejs(info: string | PackInfo, $input?: InputOptions, $output?: OutputOptions): RollupConfig[] {
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
  const rel = slash(pack.esnext) || path.relative(dir.lib, pack.main);
  const entry = rel.slice(0, -extname(rel).length);
  const input = resolve(pack.esnext ? "" : dir.src, rel);

  const external: string[] = [
    Module.builtinModules,
    pack.dependencies && Object.keys(pack.dependencies),
    pack.peerDependencies && Object.keys(pack.peerDependencies),
  ].filter(Boolean).flat();

  // default input options
  $input = clean({
    ...$input,
  });

  // default output options
  $output = clean({
    sourcemap: false,
    ...$output,
  });

  const modular = $input.preserveModules != null ? $input.preserveModules : true;
  const sourcemap = !!$output.sourcemap;
  const context: Context = {
    modular,
    directories: dir,
    external,
    output: $output,
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

  const outputs = new Set<string>();

  /** Primary bundle output options. */
  const main = output(input, pack.main, modular, outputs, {
    ...$output,
    format: "cjs",
    esModule: false, // NodeJS does not require to define __esModule
    preferConst: true, // NodeJS supports `const` since early versions
    strict: false, // NodeJS modules are strict by default
  });

  /** ECMAScript bundle output options. */
  const module$: OutputOptions = output(input, pack.module, true, outputs, {
    ...$output,
    format: "esm",
  });

  const es2015: OutputOptions = output(input, pack.es2015, true, outputs, {
    ...$output,
    format: "esm",
  });

  const esm5: OutputOptions = output(input, pack.esm5, true, outputs, {
    ...$output,
    format: "esm",
  });

  const esm2015: OutputOptions = output(input, pack.esm2015, true, outputs, {
    ...$output,
    format: "esm",
  });

  const fesm5: OutputOptions = output(input, pack.fesm5, false, outputs, {
    ...$output,
    format: "esm",
  });

  const fesm2015: OutputOptions = output(input, pack.fesm2015, false, outputs, {
    ...$output,
    format: "esm",
  });

  /** TypeScript compiler options.  */
  const compilerOptions: CompilerOptions = {
    declarationMap: sourcemap,
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

  /** Primary bundle. */
  const mainConfig = ts(null, main);

  /** ES5 bundles. */
  const esm5Config = ts(1, esm5);
  const fesm5Config = ts(1, fesm5);
  const moduleConfig = ts(1, module$);

  /** ES2015 bundles. */
  const es2015Config = ts(2, es2015);
  const esm2015Config = ts(2, esm2015);
  const fesm2015Config = ts(2, fesm2015);

  /** Generates bundle for each executable script. */
  const binConfigs = collectBinFiles(pack, context, pack.roll)
    .map(x => createBinConfig(x, info as PackInfo, context));

  // `rollup` will run this configurations in sequence
  return [
    // primary
    mainConfig,
    // ES5
    esm5Config,
    fesm5Config,
    // ES2015
    moduleConfig,
    es2015Config,
    esm2015Config,
    fesm2015Config,
    // typings
    dtsConfig,
    // executables
    ...binConfigs,
  ].filter(Boolean);

  function ts(target: ScriptTarget, ...output: OutputOptions[]): RollupConfig {
    output = output.filter(Boolean);
    const modular = output.every(x => x.dir);
    return output.length && {
      ...$input,
      input,
      output,
      external,
      preserveModules: modular,
      plugins: [
        clear({
          targets: [
            dir.tmp,
            output.map(x => x.dir || x.file),
          ].flat().filter(isSafeToDelete),
        }),
        typescript({
          external,
          compilerOptions: withTarget(compilerOptions, target),
          types: !modular && pack.types,
        }),
        cleanup(context.cleanup),
      ],
    };
  }
}

function withTarget(options: CompilerOptions, target: ScriptTarget) {
  return target != null ? {...options, target} : options;
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

function clean<T>(object: T): T {
  for (const key in object)
    if (isEmptyOrUndefined(object[key]))
      delete object[key];
  return object;
}

function isEmptyOrUndefined(item: any): boolean {
  if (item && typeof item === "object")
    return Object.keys(item).length < 1;
  return item === void 0;
}
