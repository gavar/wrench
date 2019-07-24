import { InputOptions, OutputOptions, RollupOptions } from "rollup";

/** Package fields which may be referenced for conventional build. */
export interface Package {
  /**
   * Path to an entry point of the library.
   * For best results should without extension in form of `lib/index`,
   * so NodeJS could automatically pick `lib/index.mjs` when `--experimental-modules`.
   *
   * When not provided:
   * - outputs in a root directory: `index.(js|mjs)`.
   *
   * Affects on:
   * - {@link Package.directories.src}
   * - {@link Package.directories.lib}
   */
  main: string;

  /**
   * Name of the library, primarily required by `npm` in order to publish.
   * Imports by the name are considered external, so it makes possible to import itself from anywhere.
   * @see https://rollupjs.org/guide/en/#external
   */
  name: string;

  /**
   * Path to the output type definitions (.d.ts).
   * Type definition bundle will be turned off when value omitted.
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
  /** List of external modules allowed to use by the package. */
  external: string[];

  /** Resolved value of package directories. */
  directories: PackageDirectories;

  /** Cache directory for `rollup-plugin-typescript2`. */
  rts2Cache: string;

  /** Shared options for `rollup-plugin-node-resolve`. */
  resolve: import("rollup-plugin-node-resolve").Options;
}
