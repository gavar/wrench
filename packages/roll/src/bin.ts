import typescript from "@wrench/roll-typescript";
import { cyan } from "colors";
import fs from "fs";
import Module from "module";
import path from "path";
import { InputOptions, PartialResolvedId, Plugin, PluginContext } from "rollup";
import cleanup from "rollup-plugin-cleanup-chunk";
import { PackInfo } from "./nodejs";
import { Context, Package, RollupConfig } from "./types";
import { output, resolve } from "./util";

/**
 * Package executable file.
 * @see Package#bin
 */
export interface BinFile {
  /** Name of the cli command. */
  name: string;
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
  const dir = path.dirname(info.path);
  return {
    input: file.input,
    preserveModules: modular,
    output: output(file.output, modular, {
      format: "cjs",
      banner: [
        "#!/usr/bin/env node", // make file executable
        `require("source-map-support/register");`, // enable sourcemaps support
      ].join("\n"),
      sourcemap: true,
      esModule: false, // NodeJS does not require to define __esModule
      preferConst: true, // NodeJS supports `const` since early versions
      strict: false, // NodeJS modules are strict by default,
    }),
    external: context.external,
    plugins: [
      binResolvePlugin(dir, pack),
      typescript(),
      cleanup(context.cleanup),
    ],
  };
}

/**
 * Gather `bin` files associated with the package.
 * @param pack - `package.json` contents.
 * @param context - configuration context.
 */
export function collectBinFiles(pack: Package, context: Context): BinFile[] {
  const dir = context.directories;

  // check for `bin` scripts in `package.json`
  if (pack.bin)
    return Object.keys(pack.bin)
      .map(function (name) {
        const input = resolve(dir.cli, name);
        const output = pack.bin[name];
        return {name, input, output};
      });

  // scan `cli` directory for executable scripts when all of above true:
  // - package explicitly states to include 'bin' directory by defining its path
  // - package has `cli` directory containing files to become executables
  if (pack.directories && pack.directories.bin && fs.existsSync(dir.cli))
    return fs.readdirSync(dir.cli).map(input => {
      input = path.join(dir.cli, input);
      const ext = path.extname(input);
      const name = path.basename(input, ext);
      const output = path.join(dir.bin, name + ".js");
      return {name, input, output};
    });

  return [];
}

function binResolvePlugin(dir: string, pack: Package): Plugin {
  const entries = resolveEntryPoints(dir, pack);
  const ownDirs = resolveOwnDirs(dir, pack, entries);
  return {
    name: "bin-resolve",
    options({input}: InputOptions) {
      if (typeof input === "object" && !Array.isArray(input))
        for (const key of Object.keys(input)) {
          const dst = path.normalize(key);
          const src = path.normalize((input as any)[key]);
          console.log(cyan(`${src} → ${dst}`));
        }
      return null;
    },
    resolveId(this: PluginContext, source: string, importer: string | undefined) {
      if (source && importer) {
        const id = tryResolve(source, importer);
        // resolve to directory with `package.json`,
        // so further plugins could use `module` field if applicable
        if (id && entries.has(id))
          return {
            id: dir,
            external: true,
            moduleSideEffects: true,
          } as PartialResolvedId;

        if (id && ownDirs.some(dirOwnThis, id))
          return {
            id,
            external: true,
            moduleSideEffects: true,
          } as PartialResolvedId;
      }
    },
  };
}

function tryResolve(source: string, importer: string): string {
  try {
    importer = path.resolve(importer);
    const r = Module.createRequire(importer);
    return r.resolve(source);
  } catch (e) {

  }
}

const entryKeys: Array<keyof Package> = [
  "main",
  "module",
];

function resolveEntryPoints(dir: string, pack: Package): Set<string> {
  const entries = new Set<string>();
  for (const key of entryKeys)
    if (pack[key])
      entries.add(path.resolve(dir, pack[key] as string));
  return entries;
}

function resolveOwnDirs(dir: string, pack: Package, entry: Iterable<string>): string[] {
  const entries = Array.from(entry).map(path.dirname).concat(
    dir,
    pack.directories.lib,
    pack.directories.bin,
    pack.directories.cli,
  );

  const dirs = new Set<string>();
  for (let entry of entries)
    if (entry)
      dirs.add(path.resolve(dir, entry));

  return [...dirs];
}

function dirOwnThis(this: string, dir: string) {
  const rel = path.relative(dir, this);
  return !rel.startsWith("..");
}
