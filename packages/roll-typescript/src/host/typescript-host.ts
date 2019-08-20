import {
  CompilerOptions,
  Diagnostic,
  DiagnosticMessage,
  Map as ESMap,
  PrinterOptions,
  ScriptKind,
  System,
} from "typescript";
import { extname } from "../util";

/** Provides reference to a TypeScript library to use. */
export interface TypeScriptHost {
  /** TypeScript library. */
  readonly ts: TypeScript;
}

/**
 * TypeScript library type definitions, including some internal methods.
 * Defines return types for some methods as some editors (intelliJ IDEA) struggles to resolve it itself.
 */
export type TypeScript = typeof import("typescript") & {
  sys: System;
  readonly Diagnostics: Record<string, DiagnosticMessage>;
  createMap<T>(): ESMap<T>;
  getScriptKindFromFileName(fileName: string): ScriptKind;
  createCompilerDiagnostic(message: DiagnosticMessage, ...args: (string | number | undefined)[]): Diagnostic;
  getNewLineCharacter(options: CompilerOptions | PrinterOptions, getNewLine?: () => string): string;
  readConfigFile(fileName: string, readFile: (path: string) => string | undefined): TsConfigJsonParse;
}

export interface TsConfigJsonParse {
  config: TsConfigJson;
  error?: Diagnostic;
}

export interface TsConfigJson {
  extends?: string;
  files?: string[];
  include?: string[];
  exclude?: string[];
  compilerOptions?: CompilerOptions;
}

export function getScriptKind({ts}: TypeScriptHost, fileName: string): ScriptKind {
  return fileName
    ? ts.getScriptKindFromFileName(fileName)
    : ts.ScriptKind.Unknown;
}

export function isTsOrTsx({ts}: TypeScriptHost, fileName: string): boolean {
  if (fileName) {
    const e = extname(fileName);
    switch (e) {
      case ts.Extension.Ts:
      case ts.Extension.Tsx:
        return true;
    }
  }
}
