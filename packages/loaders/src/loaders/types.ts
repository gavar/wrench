export interface LoaderRegistrar<T = any> {
  /**
   * Register loader module.
   * @param loader - loader instance acquired by loading loader entry file.
   * @param ext - file extensions loader is loading for.
   */
  (loader: T, ext: string): void;
}

export interface RequireTransform {
  (m: NodeModule, filename: string): any;
}

export type Loader = string | LoaderHook;
export type LoaderHook<T = any> = [string, LoaderRegistrar<T>?];

export interface LoaderRegistry {
  /** Loaders to install on start. */
  "*": Loader | Loader[];
  /** Loaders to install when importing file with particular extension. */
  [ext: string]: Loader | Loader[];
}
