import { Plugin, PluginContext, RenderedChunk } from "rollup";
import { CompilerOptions, FormatCodeSettings, IScriptSnapshot, LanguageServiceHost, TextChange } from "typescript";

type TypeScript = typeof import("typescript");

const defaultFormatCodeSettings: FormatCodeSettings = {
  indentSize: 2,
  indentStyle: 2,
  newLineCharacter: "\n",
  convertTabsToSpaces: true,
  insertSpaceAfterCommaDelimiter: true,
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
  options = {
    settings: defaultFormatCodeSettings,
    ...options,
  };

  const ts = options.typescript || require("typescript");
  const host = new Host(ts);
  const service = ts.createLanguageService(host);

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
      host.files[fileName] = ts.ScriptSnapshot.fromString(code);
      const edits = service.getFormattingEditsForDocument(fileName, options)
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
  readonly files: Record<string, IScriptSnapshot>;

  constructor(ts: TypeScript, options?: CompilerOptions) {
    this.ts = ts;
    this.files = {};
    this.options = options || ts.getDefaultCompilerOptions();
  }

  getCompilationSettings() { return this.options; };
  getScriptFileNames(): string[] { return Object.keys(this.files); }
  getScriptVersion(fileName: string): string { return "0"; }
  getScriptSnapshot(fileName: string): IScriptSnapshot { return this.files[fileName]; }
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
  return value && value.endsWith("}");
}

function trim(value: string) {
  return value.trim();
}
