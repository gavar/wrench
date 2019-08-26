// export interface LoaderRegistrar<T = any> {
//   /**
//    * Register loader module.
//    * @param loader - loader instance acquired by loading loader entry file.
//    * @param ext - file extensions loader is loading for.
//    */
//   (loader: T, ext: string): void;
// }


export type Loader = string;
export type LoaderWithProps<P = any> = [Loader, LoaderProps?];
export type LoaderProps<P = any> = {
  func?: string,
  args?: P
};


export type LoaderOption = Loader | LoaderWithProps

export interface LoaderRegistry {
  /** Loaders to install on start. */
  "*": LoaderOption | LoaderOption[];
  /** Loaders to install when importing file with particular extension. */
  [ext: string]: LoaderOption | LoaderOption[];
}