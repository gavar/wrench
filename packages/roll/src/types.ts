import { InputOptions, ModuleFormat, OutputOptions, RollupOptions } from "rollup";

/** Package fields which may be referenced for conventional build. */
export interface Package {
  /**
   * Name of the library, primarily required by `npm` in order to publish.
   */
  name: string;

  /**
   * Primary entry point of the package.
   * Defines the output path for {@link ModuleFormat cjs} bundle.
   * @see https://docs.npmjs.com/files/package.json#main
   */
  main: string;

  /**
   * Entry point for ECMA script modules.
   * Defines the output path for {@link ModuleFormat es} bundle.
   * {@link ModuleFormat ES} bundle won't be generated if this field is empty.
   * NodeJS automatically picks this entry point when `--experimental-modules`.
   * @see https://github.com/rollup/rollup/wiki/pkg.module
   */
  module?: string;

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
}
