import { identity, pickBy } from "lodash";
import {
  CompilerOptions,
  ConfigFileDiagnosticsReporter,
  Diagnostic,
  ExtendedConfigCacheEntry,
  FormatDiagnosticsHost,
  Map,
  ParseConfigFileHost,
  ParseConfigHost,
  ParsedCommandLine,
} from "typescript";
import { bindToSelf, canonical, reportDiagnosticByConsole } from "../util";
import { reportDiagnostics, ReportHost } from "./report-host";
import { TsConfigJson, TypeScript, TypeScriptHost } from "./typescript-host";

export interface ParseHost extends TypeScriptHost, FormatDiagnosticsHost, ParseConfigFileHost {
  /** Configuration resolutions cache. */
  configCache: Map<ExtendedConfigCacheEntry>;

  /**
   * Current working directory.
   * Affects on return value of {@link ParseHost.getCurrentDirectory}
   */
  currentDirectory: string;
}

/**
 * Parsing host with diagnostic reporting functionality.
 */
export class ParseReportHost implements TypeScriptHost, ParseHost, ReportHost {
  /** @inheritdoc */
  readonly ts: TypeScript;

  /** New line character. */
  newLine: string;

  /** @inheritdoc */
  configCache: Map<ExtendedConfigCacheEntry>;

  /** @inheritdoc */
  currentDirectory: string;

  /** @inheritdoc */
  useCaseSensitiveFileNames: boolean;

  constructor(ts: TypeScript, options?: CompilerOptions, props?: Partial<ParseHost & ReportHost>) {
    bindToSelf(this, ParseReportHost.prototype);
    options = options || ts.getDefaultCompilerOptions();
    this.ts = ts;
    this.configCache = ts.createMap();
    this.newLine = ts.getNewLineCharacter(options);
    this.currentDirectory = ts.sys.getCurrentDirectory();
    this.useCaseSensitiveFileNames = ts.sys.useCaseSensitiveFileNames;
    Object.assign(this, pickBy(props, identity));
  }

  /** @inheritdoc */
  getCanonicalFileName(fileName: string): string {
    return canonical(fileName);
  };

  /** @inheritdoc */
  getCurrentDirectory(): string {
    return this.currentDirectory;
  }

  /** @inheritdoc */
  getNewLine(): string {
    return this.newLine;
  }

  /** @inheritdoc */
  fileExists(path: string): boolean {
    return this.ts.sys.fileExists(path);
  };

  /** @inheritdoc */
  readFile(path: string): string | undefined {
    return this.ts.sys.readFile(path);
  };

  /** @inheritdoc */
  readDirectory(path: string,
                extensions?: ReadonlyArray<string>,
                excludes?: ReadonlyArray<string>,
                includes?: ReadonlyArray<string>,
                depth?: number): string[] {
    return this.ts.sys.readDirectory(path, extensions, excludes, includes, depth);
  }

  /** @inheritdoc */
  onUnRecoverableConfigFileDiagnostic(diagnostic: Diagnostic): void {
    this.reportDiagnostic(diagnostic);
  };

  /** @inheritdoc */
  reportDiagnostic(diagnostic: Diagnostic): void {
    reportDiagnosticByConsole(diagnostic, this);
    if (diagnostic.category === this.ts.DiagnosticCategory.Error)
      throw new Error(this.ts.formatDiagnostic(diagnostic, this));
  }

  /** @inheritdoc */
  trace(s: string): void {
    this.ts.sys.write(s + this.newLine);
  }
}

export function findConfigFile(host: TypeScriptHost & ParseConfigFileHost, configName?: string): string {
  const {ts} = host;
  const currentDirectory = host.getCurrentDirectory();
  const configPath = ts.findConfigFile(currentDirectory, host.fileExists, configName);
  if (!configPath) {
    const template = ts.Diagnostics.Cannot_find_a_tsconfig_json_file_at_the_specified_directory_Colon_0;
    const diagnostic = ts.createCompilerDiagnostic(template, configPath);
    host.onUnRecoverableConfigFileDiagnostic(diagnostic);
  }
  return configPath;
}

export function readConfigFile(configPath: string, host: TypeScriptHost & ParseConfigHost & ConfigFileDiagnosticsReporter): TsConfigJson {
  const {ts} = host;
  const {error, config} = ts.readConfigFile(configPath, host.readFile);
  if (error) host.onUnRecoverableConfigFileDiagnostic(error);
  return config;
}

export function parseJsonConfigFileContent(json: TsConfigJson, host: ParseHost & ReportHost,
                                           options?: CompilerOptions, configFileName?: string): ParsedCommandLine {
  const {ts, configCache} = host;
  const basePath = host.getCurrentDirectory();
  const pcl = ts.parseJsonConfigFileContent(json, host, basePath, options, configFileName, void 0, void 0, configCache);
  reportDiagnostics(host, pcl.errors);
  return pcl;
}
