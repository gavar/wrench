import { ModuleFormat } from "rollup";
import { TypeScriptHost } from "../host";

/**
 * Converts {@link ModuleFormat} to a matching {@link TypeScript.ModuleKind}.
 * @param format - rollup module format.
 * @param ts - typescript library.
 */
export function formatToModule(format: ModuleFormat, {ts}: TypeScriptHost): import("typescript").ModuleKind {
  switch (format) {
    case "amd":
      return ts.ModuleKind.AMD;
    case "cjs":
    case "commonjs":
      return ts.ModuleKind.CommonJS;
    case "system":
      return ts.ModuleKind.System;
    case "es":
    case "esm":
    case "module":
      return ts.ModuleKind.ESNext;
    case "umd":
      return ts.ModuleKind.UMD;
    case "iife":
      return ts.ModuleKind.None;
    default:
      throw new Error(`unknown format type: ${format}`);
  }
}


