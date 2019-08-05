import {
  CompilerHost,
  CompilerOptions,
  DocumentRegistry,
  ModuleResolutionCache,
  Program,
  ScriptTarget,
} from "typescript";
import { EmitHost } from "./emit-host";
import { ResolutionHost } from "./resolution-host";
import { TypeScriptHost } from "./typescript-host";
import { WriteHost } from "./write-host";

export interface ProjectHost extends TypeScriptHost, CompilerHost, EmitHost, ResolutionHost, WriteHost {
  /** Compiler options of this host, may differ from {@link program#getCompilerOptions}. */
  readonly options: CompilerOptions;

  /** List of file names to use for compilation. */
  readonly fileNames: ReadonlyArray<string>;

  /** Current working directory. */
  readonly currentDirectory: string;

  /** Global registry of source files to use for all programs. */
  readonly documentRegistry: DocumentRegistry;

  /** @inheritdoc */
  readonly moduleResolutionCache: ModuleResolutionCache;

  /** @inheritdoc */
  writeFile(fileName: string, content: string, writeByteOrderMark?: boolean): void;

  /**
   * Program to use for TS to JS transformation.
   * Create new program instance when state is dirty or program is null.
   */
  getProgram(): Program;

  /** @inheritdoc */
  getCurrentDirectory(): string;

  /**
   * Set root file names to use by program.
   * @param fileNames - root file names.
   * @param canonical - whether paths are already in canonical format.
   */
  setFileNames(fileNames: ReadonlyArray<string>, canonical?: boolean): void;

  /**
   * Create host inheriting properties from this object.
   * @param props - properties to override.
   */
  fork(props: Partial<ProjectHost>): this;
}

export function getKeyForCompilationSettings(host: ProjectHost, language: ScriptTarget) {
  const {options, documentRegistry} = host;
  const {target} = options;

  // check target match current host options
  if (target === options.target)
    return documentRegistry.getKeyForCompilationSettings(options);

  // substitute target, sine it changes key
  try {
    options.target = language;
    return documentRegistry.getKeyForCompilationSettings(options);
  } finally {
    options.target = target;
  }
}

export function addFileNames(host: ProjectHost, fileNames: ReadonlyArray<string>): void {
  let dirty = false;
  const set = new Set(host.fileNames);
  for (const fileName of fileNames)
    if (set.add(host.getCanonicalFileName(fileName)))
      dirty = true;

  host.setFileNames([...set], true);
}
