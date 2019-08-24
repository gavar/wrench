import { CompilerOptions, CustomTransformers } from "typescript";
import { LoaderHook } from "./types";

export interface TsNode {
  /** Register TypeScript compiler. */
  register(options?: TsNodeOptions): unknown;
}

export interface RawCompilerOptions extends Omit<CompilerOptions, "module"> {
  module: "none" | "commonjs" | "amd" | "umd" | "system" | "es2015" | "es6" | "esnext";
}

/**
 * Registration options.
 */
export interface TsNodeOptions {
  pretty?: boolean | null;
  typeCheck?: boolean | null;
  transpileOnly?: boolean | null;
  logError?: boolean | null;
  files?: boolean | null;
  compiler?: string;
  ignore?: string[];
  project?: string;
  skipIgnore?: boolean | null;
  skipProject?: boolean | null;
  preferTsExts?: boolean | null;
  compilerOptions?: RawCompilerOptions;
  ignoreDiagnostics?: Array<number | string>;
  readFile?: (path: string) => string | undefined;
  fileExists?: (path: string) => boolean;
  transformers?: CustomTransformers;
}

export const TS_NODE_HOOK: LoaderHook<TsNode> = ["ts-node", loader => {
  loader.register({
    compilerOptions: {
      module: "commonjs",
    },
  });
}];
