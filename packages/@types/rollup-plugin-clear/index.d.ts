declare module "rollup-plugin-clear" {
  import { Plugin } from "rollup";

  interface Options {
    targets: string[];
  }

  function clear(options: Options): Plugin;
  export = clear;
}

