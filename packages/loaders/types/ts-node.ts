import { CompilerOptions } from "typescript";

/** Registration options for `ts-node` module. */
export type Options = import("ts-node").Options & {
  compilerOptions?: RawCompilerOptions;
}

export interface RawCompilerOptions extends Omit<CompilerOptions, "module"> {
  module: "none" | "commonjs" | "amd" | "umd" | "system" | "es2015" | "es6" | "esnext";
}