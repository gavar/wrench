import fs from "fs";
import Module from "module";
import path from "path";
import ts2 from "rollup-plugin-typescript2";
import { CompilerOptions } from "typescript";
import { Context, Package, RollupConfig } from "./types";
import { resolveThrow } from "./util";

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
 * @param file - `bin` file information.
 * @param pack - `package.json` contents.
 * @param context - configuration context.
 */
export function createBinFileConfig(file: BinFile, pack: Package, context: Context): RollupConfig {
  // TODO: borrow entry points from node-resolve plugin
  const entry = new Set();
  entry.add(path.resolve(pack.main));
  entry.add(path.resolve(pack.module));

  return {
    input: file.input,
    output: {
      file: file.output,
      format: "cjs",
      sourcemap: true,
      banner: "#!/usr/bin/env node", // make file executable
      esModule: false, // NodeJS does not require to define __esModule
      preferConst: true, // NodeJS supports `const` since early versions
      strict: false, // NodeJS modules are strict by default,
    },
    external: context.external,
    plugins: [
      {
        name: "self-import-as-external",
        async resolveId(source: string, importer: string | undefined) {
          if (importer) {
            const r = Module.createRequire(path.resolve(importer));
            const id = r.resolve(source);
            return entry.has(id)
              ? {id: path.resolve(path.dirname(importer), source), external: true} // path to package.json
              : {id, external: false};
          }
        },
      },
      ts2({
        cacheRoot: context.rts2Cache,
        useTsconfigDeclarationDir: true,
        tsconfigOverride: {
          files: [file.input],
          compilerOptions: {
            composite: false,
            declaration: false,
            declarationMap: false,
          } as CompilerOptions,
        },
      }),
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
        const input = resolveThrow(dir.cli, name);
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
