import { castArray, isEmpty, map, omitBy } from "lodash";
import { dirname } from "path";
import { Mutable } from "tstt";
import {
  CompilerOptions,
  CustomTransformers,
  Diagnostic,
  DocumentRegistry,
  FormatDiagnosticsHost,
  LanguageServiceHost,
  ModuleResolutionCache,
  Path,
  Program,
  ScriptKind,
  ScriptTarget,
  SourceFile,
} from "typescript";
import {
  computeCommonSourceDirectoryOfFilenames,
  getKeyForCompilationSettings,
  getScriptKind,
  ProjectHost,
  ResolutionHost,
  ScriptText,
  TypeScript,
} from "../host";
import { TransformersFactory } from "../typescript";
import { bindToSelf, canonical, rebind, reportDiagnosticByConsole } from "../util";

const NULL: Partial<ScriptText> = {
  version: "0",
};

export interface ProjectProps extends Partial<Project> {
  ts: TypeScript;
  options: CompilerOptions;
}

export class Project implements LanguageServiceHost, ProjectHost, ResolutionHost {
  /** @inheritdoc */
  readonly ts: TypeScript;

  /** @inheritdoc */
  readonly options: CompilerOptions;

  /** @inheritdoc */
  readonly documentRegistry: DocumentRegistry;

  /** @inheritdoc */
  readonly moduleResolutionCache: ModuleResolutionCache;

  /**
   * New line character.
   * @see ParseConfigHost.getNewLine
   */
  readonly newLine: string;

  /**
   * Current working directory.
   * @see ParseConfigHost.getCurrentDirectory
   * @see ModuleResolutionHost.getCurrentDirectory
   * @see FormatDiagnosticsHost.getCurrentDirectory
   */
  readonly currentDirectory: string;

  /** Whether file system is case-sensitive. */
  readonly caseSensitiveFileNames: boolean;

  /**
   * Location of the typescript libraries.
   * @see System.getExecutingFilePath
   */
  readonly defaultLibLocation: string;

  /** List of root file names. */
  readonly fileNames: ReadonlyArray<string>;

  /** Cache of scripts. */
  readonly scripts: Record<string, ScriptText> = {};

  /** Common source directory to use for emit. */
  readonly commonSourceDirectory: string;

  /** @inheritdoc */
  readonly transform?: CustomTransformers;

  /** Factory to use for creating source code transformers. */
  transformerFactory?: TransformersFactory;

  private dirty: boolean;
  private program: Program;

  constructor(props: ProjectProps) {
    rebind(Object.assign(this, props), props);
    initialize.call(this, Project.prototype, bindToSelf);
  }

  /** @inheritdoc */
  fork(props: Partial<this>): this {
    const host: this = Object.assign(Object.create(this), props);
    (host as Mutable<this>).options = {...this.options, ...props.options};
    initialize.call(host, this, rebind);
    host.dirty = true;
    return host;
  }

  /** @inheritdoc */
  setFileNames(fileNames: ReadonlyArray<string>, canonical?: boolean): void {
    if (!canonical) fileNames = fileNames.map(this.getCanonicalFileName);
    (this as Mutable<this>).fileNames = fileNames;
    (this as Mutable<this>).commonSourceDirectory = computeCommonSourceDirectoryOfFilenames(this, this.fileNames);
    this.dirty = true;
  }

  /** @inheritdoc */
  getProgram(checkDirty?: boolean): Program {
    if (checkDirty)
      this.checkProgramDirty();

    if (this.dirty || !this.program) {
      this.program = this.ts.createProgram({
        host: this,
        options: this.options,
        rootNames: this.fileNames,
        oldProgram: this.program,
      });

      (this as Mutable<this>).transform = toCustomTransformers(this.transformerFactory, this.program);
      this.dirty = false;
    }
    return this.program;
  }

  /** @inheritdoc */
  checkProgramDirty(): void {
    if (!this.dirty && this.program)
      this.dirty = this.program.getSourceFiles().some(isVersionDiff, this.scripts);
  }

  updateScript(fileName: string, text: string): ScriptText {
    text = text || "";
    fileName = this.getCanonicalFileName(fileName);
    let script = this.scripts[fileName];
    if (script) {
      if (script.text !== text) {
        script.text = text;
        script.version = String(+script.version + 1);
      }
    } else {
      script = this.ts.ScriptSnapshot.fromString(text) as ScriptText;
      script.text = text;
      script.kind = this.getScriptKind(fileName);
      script.version = NULL.version;
      this.scripts[fileName] = script;
    }

    // mark as dirty
    if (!this.dirty && this.program) {
      const file: SourceFileInternal = this.program.getSourceFile(fileName);
      this.dirty = file && file.version !== script.version;
    }

    return script;
  }

  /** @inheritdoc */
  reportDiagnostic(diagnostic: Diagnostic): void {
    reportDiagnosticByConsole(diagnostic, this);
  }

  /** @inheritdoc */
  getSourceFile(fileName: string, target: ScriptTarget, onError: ErrorCallback = throwError): SourceFile {
    return this.getSourceFileByPath(fileName, fileName as Path, target, onError);
  }

  /** @inheritdoc */
  getCommonSourceDirectory(): string {
    return this.commonSourceDirectory;
  }

  /** @inheritdoc */
  getSourceFileByPath(fileName: string, path: Path, target: ScriptTarget, onError: ErrorCallback = throwError) {
    const script = this.getScriptSnapshot(fileName);
    if (script) {
      // the only difference between acquire / update is reference counting
      // since we don't release documents, just use update for every request
      const key = getKeyForCompilationSettings(this, target);
      return this.documentRegistry.updateDocumentWithKey(fileName, path, this.options, key, script, script.version, script.kind);
    }
  }

  /** @inheritdoc */
  getScriptKind(fileName: string): ScriptKind {
    return getScriptKind(this, fileName);
  }

  /** @inheritdoc */
  getNewLine(): string { return this.newLine; }

  /** @inheritdoc */
  getCurrentDirectory(): string { return this.currentDirectory; }

  /** @inheritdoc */
  getCanonicalFileName(fileName: string): string {
    return canonical(fileName, this.caseSensitiveFileNames);
  };

  /** @inheritdoc */
  getCompilationSettings(): CompilerOptions {
    return this.options;
  }

  /** @inheritdoc */
  getScriptFileNames(): string[] {
    return Object.keys(this.scripts);
  }

  /** @inheritdoc */
  getScriptVersion(fileName: string): string {
    return (this.scripts[fileName] || NULL).version;
  }

  /** @inheritdoc */
  getScriptSnapshot(fileName: string): ScriptText {
    return this.scripts[fileName] || this.updateScript(fileName, this.readFile(fileName));
  }

  /** @inheritdoc */
  getDefaultLibFileName(options: CompilerOptions): string {
    return this.ts.getDefaultLibFileName(options);
  }

  /** @inheritdoc */
  getDefaultLibLocation(): string {
    return this.defaultLibLocation;
  }

  /** @inheritdoc */
  useCaseSensitiveFileNames(): boolean {
    return this.caseSensitiveFileNames;
  }

  /** @inheritdoc */
  fileExists(fileName: string): boolean {
    return this.ts.sys.fileExists(fileName);
  }

  /** @inheritdoc */
  readFile(fileName: string): string | undefined {
    return this.ts.sys.readFile(fileName);
  };

  /** @inheritdoc */
  directoryExists(directoryName: string): boolean {
    return this.ts.sys.directoryExists(directoryName);
  }

  /** @inheritdoc */
  getDirectories(path: string): string[] {
    return this.ts.sys.getDirectories(path);
  }

  /** @inheritdoc */
  readDirectory(path: string,
                extensions?: readonly string[],
                exclude?: readonly string[],
                include?: readonly string[],
                depth?: number): string[] {
    return this.ts.sys.readDirectory(path, extensions, exclude, include, depth);
  }

  /** @inheritdoc */
  realpath(path: string): string {
    return this.ts.sys.realpath(path);
  }

  /** @inheritdoc */
  writeFile(path: string, data: string, writeByteOrderMark?: boolean): void {
    this.ts.sys.writeFile(path, data, writeByteOrderMark);
  }

  /** @inheritdoc */
  trace(s: string): void {
    return this.ts.sys.write(s + this.newLine);
  }
}

interface ErrorCallback {
  (message: string): void;
}

function throwError(message: string) {
  throw new Error(message);
}

function initialize<T extends Project>(this: Mutable<T>, prototype?: T, binder?: Binder<T>): void {
  if (binder && prototype)
    binder(this, prototype);

  this.scripts = this.scripts || {};
  this.fileNames = this.fileNames || [];
  this.newLine = this.ts.getNewLineCharacter(this.options);
  this.documentRegistry = this.documentRegistry || this.ts.createDocumentRegistry();
  this.currentDirectory = this.currentDirectory || this.ts.sys.getCurrentDirectory();
  this.defaultLibLocation = this.defaultLibLocation || dirname(this.ts.sys.getExecutingFilePath());
  this.caseSensitiveFileNames = this.caseSensitiveFileNames || this.ts.sys.useCaseSensitiveFileNames;
  this.commonSourceDirectory = this.commonSourceDirectory || computeCommonSourceDirectoryOfFilenames(this, this.fileNames);
  this.moduleResolutionCache = this.ts.createModuleResolutionCache(this.currentDirectory, this.getCanonicalFileName, this.options);
}

interface Binder<T> {
  (self: T, source: T): void;
}

function isVersionDiff(this: Record<string, ScriptText>, file: SourceFileInternal) {
  return file.version !== (this[file.path] || NULL).version;
}

interface SourceFileInternal extends SourceFile {
  path?: string;
  version?: string;
}

function toCustomTransformers(factory: TransformersFactory, program: Program): CustomTransformers {
  if (factory) {
    const transforms = castArray(factory(program));
    const conf: CustomTransformers = omitBy({
      before: map(transforms, "before"),
      after: map(transforms, "after"),
      afterDeclarations: map(transforms, "afterDeclarations"),
    });

    if (!isEmpty(conf))
      return conf;
  }
}
