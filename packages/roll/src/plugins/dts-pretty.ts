import { Plugin, PluginContext, RenderedChunk } from "rollup";
import {
  CompilerOptions,
  FormatCodeSettings,
  IScriptSnapshot,
  LanguageService,
  LanguageServiceHost,
  TextChange,
} from "typescript";
import { TypeScript } from "../types";

/** Default settings for pretty output of `.d.ts` files. */
export const defaultDtsFormatCodeSettings: FormatCodeSettings = {
  indentSize: 2,
  indentStyle: 2,
  newLineCharacter: "\n",
  convertTabsToSpaces: true,
  insertSpaceAfterCommaDelimiter: true,
  insertSpaceBeforeAndAfterBinaryOperators: true,
};

/** {@link dtsPretty} plugin configuration options. */
export interface DtsPrettyOptions {
  /** Typescript package to use. */
  typescript?: TypeScript;

  /** Format settings to pass in typescript. */
  settings?: FormatCodeSettings;
}

/**
 * Plugin to format `.d.ts` files, inspired by `typescript-formatter` package.
 * @param options - configuration options.
 * @see https://www.npmjs.com/package/typescript-formatter
 */
export function dtsPretty(options?: DtsPrettyOptions): Plugin {
  // defaults
  options = Object.assign({}, options);
  options.settings = Object.assign({}, defaultDtsFormatCodeSettings, options.settings);

  const ts: TypeScript = options.typescript || require("typescript");
  const host = new Host(ts);
  const service: LanguageService = ts.createLanguageService(host);

  return {
    name: "dts-pretty",
    renderChunk(this: PluginContext, code: string, {fileName}: RenderedChunk) {
      // poor man format
      code = code.split("\n")
        .map(trim)
        .filter(isNonConsecutiveBlankLine)
        .map(formatLine)
        .join("\n");

      // format via typescript service rules
      host.setScriptCode(fileName, code);
      const edits = service.getFormattingEditsForDocument(fileName, options.settings)
        .sort((a: TextChange, b: TextChange) => b.span.start - a.span.start);

      // apply changes
      for (const edit of edits) {
        const head = code.slice(0, edit.span.start);
        const tail = code.slice(edit.span.start + edit.span.length);
        code = head + edit.newText + tail;
      }

      return {code};
    },
  };
}

class Host implements LanguageServiceHost {
  readonly ts: TypeScript;
  readonly options: CompilerOptions;
  private readonly scripts: Record<string, IScriptSnapshot> = {};
  private readonly versions: Record<string, string> = {};

  constructor(ts: TypeScript, options: CompilerOptions = ts.getDefaultCompilerOptions()) {
    this.ts = ts;
    this.options = options;
  }

  setScriptCode(fileName: string, code: string) {
    this.scripts[fileName] = this.ts.ScriptSnapshot.fromString(code);
    this.versions[fileName] = String((+this.versions[fileName]) + 1);
  }

  getCompilationSettings() { return this.options; };
  getScriptFileNames(): string[] { return Object.keys(this.scripts); }
  getScriptVersion(fileName: string): string { return this.versions[fileName] || "0"; }
  getScriptSnapshot(fileName: string): IScriptSnapshot { return this.scripts[fileName]; }
  getCurrentDirectory() {return process.cwd();}
  getDefaultLibFileName(options: CompilerOptions) { return this.ts.getDefaultLibFilePath(options);};
}

function formatLine(line: string, index: number, array: string[]) {
  if (shouldNewLineAfter(line, index, array)) line = line + "\n";
  return line;
}

function isComment(value: string) {
  if (value)
    return value.startsWith("//")
      || value.startsWith("/*")
      || value.startsWith("*")
      || value.endsWith("*/")
      ;
}

function isNonConsecutiveBlankLine(line: string, index: number, lines: string[]) {
  return lines[index] || lines[index - 1];
}

function shouldNewLineAfter(v: string, index: number, array: string[]) {
  const n = array[index + 1];
  if (isBlank(v) || isBlockEnter(v) || isComment(v)) return false;
  if (isBlank(n) || isBlockExit(n)) return false;

  if (isBlockExit(v)) return true; // exiting code block
  if (isComment(array[index - 1])) return true; // documented statement itself
  if (isComment(n)) return true; // next line is a documentation for next statement
}

function isBlank(value: string) {
  return !value;
}

function isBlockEnter(value: string) {
  return value && value.endsWith("{");
}

function isBlockExit(value: string) {
  if (value)
    return value.endsWith("}") || value.endsWith("};");
}

function trim(value: string) {
  return value.trim();
}
