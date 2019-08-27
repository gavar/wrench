import typescript from "@wrench/roll-typescript";
import { cyan } from "colors";
import fs from "fs";
import { get, identity } from "lodash";
import path from "path";
import { InputOptions, Plugin } from "rollup";
import cleanup from "rollup-plugin-cleanup-chunk";
import { PackInfo } from "./nodejs";
import { BinType, BundleOptions, Context, Package, RollupConfig } from "./types";
import { dirname, output, resolve } from "./util";

/**
 * Package executable file.
 * @see Package#bin
 */
export interface BinFile {
  /** Name of the cli command. */
  name: string;
  /** Bundle strategy. */
  type: BinType;
  /** Path to a input file. */
  input: string;
  /** Path for the output file. */
  output: string;
}

/**
 * Create {@link RollupConfig} to bundle package `bin` file.
 * @param file - bin file to build.
 * @param info - `package.json` location and content.
 * @param context - configuration context.
 */
export function createBinConfig(file: BinFile, info: PackInfo, context: Context): RollupConfig {
  const {pack} = info;
  const {modular} = context;
  const root = path.dirname(info.path);
  const external = [
    info.pack.name,
    ...externalDirsOf(root, pack),
    context.external,
  ].flat();
  return {
    input: file.input,
    preserveModules: modular,
    output: output(file.input, file.output, modular, {
      format: "cjs",
      sourcemap: true,
      esModule: false, // NodeJS does not require to define __esModule
      preferConst: true, // NodeJS supports `const` since early versions
      strict: false, // NodeJS modules are strict by default,
    }),
    external,
    plugins: [
      binInfoPlugin(),
      typescript({
        external,
        baseCompilerOptions: {
          rootDirs: [dirname(file.input)].filter(identity),
        },
      }),
      cleanup(context.cleanup),
    ],
  };
}

/**
 * Gather `bin` files associated with the package.
 * @param pack - `package.json` contents.
 * @param context - configuration context.
 * @param options - bundling options.
 */
export function collectBinFiles(pack: Package, context: Context, options?: BundleOptions): BinFile[] {
  const dir = context.directories;
  const type = get(options, "bin", BinType.exec);

  if (type) {
    // check for `bin` scripts in `package.json`
    if (pack.bin)
      return Object.keys(pack.bin)
        .map(function (name) {
          const input = resolve(dir.cli, name);
          let output = pack.bin[name];
          output = outputByType(type, output);
          return {name, input, output, type};
        });

    // scan `cli` directory for executable scripts when all of above true:
    // - package explicitly states to include 'bin' directory by defining its path
    // - package has `cli` directory containing files to become executables
    if (pack.directories && pack.directories.bin && fs.existsSync(dir.cli))
      return fs.readdirSync(dir.cli).map(input => {
        input = path.join(dir.cli, input);
        const ext = path.extname(input);
        const name = path.basename(input, ext);
        let output = path.join(dir.bin, name + ".js");
        output = outputByType(type, output);
        return {name, input, output, type};
      });
  }

  return [];
}

function binInfoPlugin(): Plugin {
  return {
    name: "bin-info",
    options({input}: InputOptions) {
      if (typeof input === "object" && !Array.isArray(input))
        for (const key of Object.keys(input)) {
          const dst = path.normalize(key);
          const src = path.normalize((input as any)[key]);
          console.log(cyan(`${src} → ${dst}`));
        }
      return null;
    },
  };
}

function externalDirsOf(root: string, pack: Package): string[] {
  return [
    root,
    pack.directories.lib,
    pack.directories.src,
  ].filter(identity)
    .map(x => path.resolve(root, x));
}

function outputByType(type: BinType, output: string) {
  if (type === BinType.lib) {
    const {dir, name, ext} = path.parse(output);
    return path.join(dir, "lib", name, name + ext);
  }
  return output;
}
