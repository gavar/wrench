export type Loader = string;
export type LoaderWithProps<P = any> = [Loader, LoaderProps?];
export type LoaderProps<P = any> = {
  func?: string,
  args?: P | LoaderArgsProvider<P>
};

export type LoaderOption = Loader | LoaderWithProps
export type LoaderArgsProvider<P> = () => P;

export interface LoaderRegistry {
  /** Loaders to install on start. */
  "*": LoaderOption | LoaderOption[];
  /** Loaders to install when importing file with particular extension. */
  [ext: string]: LoaderOption | LoaderOption[];
}
