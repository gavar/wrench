import { InputOptions, ModuleFormat, OutputOptions, RollupOptions } from "rollup";
import { ScriptTarget } from "typescript";

/**
 * Defines strategy of how to build package executables.
 * * "exec" - build as entry point of the executable.
 * * "lib" - build as library nearby to executable.
 */
export const enum BinType {
  /** Bundle as entry point of the executable. */
  exec = "exec",
  /** Bundle as entry point for the executable in a `bin/lib` directory. */
  lib = "lib"
}

export interface BundleOptions {
  /** Defines strategy of how to build package executables. */
  bin?: false | BinType;
}

/** Package fields which may be referenced for conventional build. */
export interface Package {
  /**
   * Name of the library, primarily required by `npm` in order to publish.
   */
  name: string;

  /**
   * Primary entry point of the package.
   * Defines the output path for {@link ModuleFormat cjs} bundle.
   * @example "./lib/index.js"
   * @see https://docs.npmjs.com/files/package.json#main
   */
  main: string;

  /**
   * Entry point for ECMA script modules.
   * Defines the output path for {@link ModuleFormat ES} bundle.
   * {@link ModuleFormat ES} bundle won't be generated if this field is empty.
   * NodeJS automatically picks this entry point when `--experimental-modules`.
   * Angular Package Format define it as entry point of {@link ModuleFormat ES} bundle using {@link ScriptTarget ES5} target.
   * @example "./esm5/index.js"
   * @see https://github.com/rollup/rollup/wiki/pkg.module
   * @see https://docs.google.com/document/d/1CZC2rcpxffTDfRDs6p1cfbmKNLA6x5O-NtkJglDaBVs/preview#heading=h.of267ihir9wt
   */
  module?: string;

  /**
   * Entry point for the unflattened ESM + ES2015 defined by Angular Package Format.
   * Defines the output path for {@link ModuleFormat ES} bundle using {@link ScriptTarget ES2015} target.
   * @example "./esm2015/index.js"
   * @see https://docs.google.com/document/d/1CZC2rcpxffTDfRDs6p1cfbmKNLA6x5O-NtkJglDaBVs/preview#heading=h.of267ihir9wt
   */
  es2015?: string;

  /**
   * Entry point for the unflattened ESM + ES5 defined by Angular Package Format.
   * Defines the output path for {@link ModuleFormat ES} bundle using {@link ScriptTarget ES5} target.
   * @example "./esm5/index.js"
   * @see https://docs.google.com/document/d/1CZC2rcpxffTDfRDs6p1cfbmKNLA6x5O-NtkJglDaBVs/preview#heading=h.of267ihir9wt
   */
  esm5?: string

  /**
   * Entry point for the unflattened ESM + ES2015 defined by Angular Package Format.
   * Defines the output path for {@link ModuleFormat ES} bundle using {@link ScriptTarget ES2015} target.
   * @example "./esm2015/index.js"
   * @see https://docs.google.com/document/d/1CZC2rcpxffTDfRDs6p1cfbmKNLA6x5O-NtkJglDaBVs/preview#heading=h.of267ihir9wt
   */
  esm2015?: string

  /**
   * Entry point for the flattened ESM + ES5 defined by Angular Package Format.
   * Defines the output path for {@link ModuleFormat ES} bundle using {@link ScriptTarget ES5} target.
   * @example "./fesm5/index.js"
   * @see https://docs.google.com/document/d/1CZC2rcpxffTDfRDs6p1cfbmKNLA6x5O-NtkJglDaBVs/preview#heading=h.of267ihir9wt
   */
  fesm5?: string

  /**
   * Entry point for the flattened ESM + ES2015 defined by Angular Package Format.
   * Defines the output path for {@link ModuleFormat ES} bundle using {@link ScriptTarget ES2015} target.
   * @example "./fesm2015/index.js"
   * @see https://docs.google.com/document/d/1CZC2rcpxffTDfRDs6p1cfbmKNLA6x5O-NtkJglDaBVs/preview#heading=h.of267ihir9wt
   */
  fesm2015?: string

  /**
   * A module ID with untranspiled code that is the primary to your program.
   * Defines path to TypeScript file to use as entry point.
   */
  esnext: string;

  /**
   * Entry point for type declarations file.
   * Defines the output path for declarations bundle.
   * Declarations bundle won't be generated if this field is empty.
   * @see https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html#including-declarations-in-your-npm-package
   */
  types?: string;

  /**
   * Set of executable scripts to bundle along the package.
   * @see {@link Package.directories.lib}
   */
  bin?: Record<string, string>;

  /** Directories to use while build process. */
  directories?: Partial<PackageDirectories>;

  /**
   * Any imports from those packages won't be included in a bundle.
   * @see https://rollupjs.org/guide/en/#external
   */
  dependencies?: Record<string, string>;

  /**
   * Any imports from those packages won't be included in a bundle.
   * @see https://rollupjs.org/guide/en#peer-dependencies
   */
  peerDependencies?: Record<string, string>;

  /** Options for `@wrench/roll` module. */
  roll?: BundleOptions;
}

export interface PackageDirectories {
  /**
   * Directory where to search for input file.
   * The input entry will be in form of: `[src]/basename(package.main)`.
   * @default "./src"
   */
  src: string;

  /**
   * Directory where to look for executables sources.
   *
   * When {@link Package.bin} is empty:
   * - scans for all files in the {@link PackageDirectories.cli cli} when {@link PackageDirectories.bin bin} is explicitly defined by the package properties.
   *
   * When {@link Package.bin} defines key-value pair:
   * - looks up for a executable source to build in form of: `[cli]/[executable-name].(ts|js)`
   *
   * @default "./cli"
   */
  cli: string;

  /**
   * Directory for output files that should be published to `npm`.
   * Cleared on every execution of the `rollup`.
   * @default `dirname(package.main}` || "./lib"
   */
  lib: string;

  /**
   * Directory containing executable files.
   * @see https://docs.npmjs.com/files/package.json#directoriesbin
   * @default "./bin"
   */
  bin: string;

  /**
   * Directory to store temporary, cached and staging files.
   * Cleared on every execution of the `rollup`.
   * @default "./tmp"
   */
  tmp: string;
}

/** Alternate version of {@link RollupOptions} which fixes some issues. */
export interface RollupConfig extends InputOptions {
  /**
   * Allows to define multiple outputs.
   * @see RollupOptions.output
   */
  output?: OutputOptions | OutputOptions[]
}

/** Configuration context sharing common values. */
export interface Context {
  /**
   * Whether to preserve original module structure.
   * @see https://rollupjs.org/guide/en#preservemodules
   */
  modular: boolean;

  /** List of external modules allowed to use by the package. */
  external: string[];

  /** Resolved value of package directories. */
  directories: PackageDirectories;

  /** Shared options for `rollup-plugin-cleanup-chunk`. */
  cleanup?: import("rollup-plugin-cleanup-chunk").Options;

  /** Base output options. */
  output: OutputOptions;
}
