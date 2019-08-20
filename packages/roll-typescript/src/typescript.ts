import { cyan } from "colors";
import path from "path";
import {
  InputOptions,
  OutputAsset,
  OutputBundle,
  OutputChunk,
  OutputOptions,
  PartialResolvedId,
  Plugin,
  PluginContext,
  RenderedChunk,
  TransformResult,
} from "rollup";
import { CompilerOptions } from "typescript";
import { bundleDts } from "./bundle-dts";
import {
  addFileNames,
  collectDependencies,
  createReportDiagnosticByPlugin,
  emitByProgram,
  isTsOrTsx,
  ProjectHost,
  resolve,
  writeEmit,
  writeOutputFile,
} from "./host";
import { createProject, forkHostByOutput, Project } from "./project";
import { createIsExternal, IsExternal, isOutputChunk, lazy, lazy2 } from "./util";

const NAME = "@wrench/typescript";
const VIRTUAL_NAME = `_virtual/${NAME}`;
const EXPORT_NULL = "exports = null;";

export interface TypeScriptOptions {
  /**
   * Path to the project configuration.
   * @default `ts.findConfigFile`
   */
  tsconfig?: string;

  /**
   * TypeScript module instance to use.
   * @default `require("typescript")`
   */
  typescript?: typeof import("typescript");
  /**
   * Compiler options to extend by {@link tsconfig}.
   * @default null
   */
  baseCompilerOptions?: CompilerOptions;
  /**
   * Compiler options to override.
   * @default null.
   */
  compilerOptions?: CompilerOptions;

  /** List of external modules. */
  external: string[];

  /** Output path for project typings bundle. */
  types?: string;
}

export function typescript(options?: TypeScriptOptions): Plugin {
  // defaults
  options = {...options};

  // normalize
  if (options.types) options.types = path.resolve(options.types);

  let isExternal: IsExternal;
  let cache: Map<any, any>;
  let exclude: Set<string>;
  let modular: boolean;

  let project: Project;
  let compilerOptions: CompilerOptions;

  let inputs: Set<string>;
  let pending: Set<string>;
  let shouldBundleDts: boolean;

  return {
    name: NAME,

    buildStart(this: PluginContext, input: InputOptions) {
      cache = new Map();
      exclude = new Set<string>([NAME, VIRTUAL_NAME]);
      modular = input.preserveModules;

      // initialize project
      [project, inputs] = lazy(this, "project", createProject, options, input);
      const {rootDir, rootDirs} = project.options;
      const roots = rootDirs ? rootDirs : rootDir ? [rootDir] : null;
      isExternal = createIsExternal(roots, options.external);

      const dependencies = collectDependencies(project, inputs, true);
      const localDependencies = dependencies.filter(x => isExternal(x) === false);
      pending = new Set(localDependencies);

      project.reportDiagnostic = createReportDiagnosticByPlugin(this);
      shouldBundleDts = !!(!modular && project.options.declarationDir && options.types);
      compilerOptions = project.options;

      // fork with ESNext target for fast transformations
      project = lazy(this, "esnext", forkESNext, project);

      // rollup may exclude `index` files, so make sure to forcibly include them
      if (modular)
        for (const id of pending)
          this.emitFile({id, type: "chunk"});
    },

    resolveId(specifier: string, importer: string): PartialResolvedId {
      if (isTsOrTsx(project, importer)) {
        const id = resolve(project, importer, specifier);
        const external = isExternal(specifier, importer, id);
        return {id, external, moduleSideEffects: true};
      }
    },

    async load(this: PluginContext, id: string) {
      if (id === NAME)
        return EXPORT_NULL;
    },

    transform(this: PluginContext, code: string, fileName: string): TransformResult {
      // mark visit
      pending.delete(fileName);

      // filter
      if (fileName === NAME) return;
      if (!isTsOrTsx(project, fileName)) return;

      // update file contents
      project.updateScript(fileName, code);

      // emit
      const program = project.getProgram();
      const out = emitByProgram(program, project, fileName);
      const {js, jsmap, dts, dtsmap} = out;

      // write declaration files for further bundling
      if (!modular) {
        if (dts) writeOutputFile(project, dts);
        if (dtsmap) writeOutputFile(project, dtsmap);
      }

      // some files may only contain type declarations
      // replacing with stub code to avoid rollup `empty bundle` warnings
      if (isEmptyCode(js.text))
        js.text = EXPORT_NULL;

      return {
        code: js.text,
        map: jsmap && jsmap.text,
        moduleSideEffects: true,
      };
    },

    renderStart(this: PluginContext) {
      // write .d.ts files excluded by tree-shaking
      if (!modular) {
        flush(project, pending, true);
        pending.clear();
      }
    },

    async renderChunk(this: PluginContext, code: string, chunk: RenderedChunk, output: OutputOptions) {
      if (chunk.fileName === VIRTUAL_NAME)
        return;

      if (modular) {
        // updates program by `checkProgramDirty` if any change occurs during transform
        const host = lazy2(cache, output, checkProgramDirty, this, outputHostKey, forkHostByOutput, output, project, compilerOptions);

        // emit
        const program = host.getProgram();
        const out = emitByProgram(program, host, chunk.facadeModuleId);
        const {js, jsmap, dts, dtsmap} = out;

        // rename to js file
        chunk.fileName = js.name;

        // TODO: update sourcemaps
        // `rollup` does not generate header / footer when `preserveModules`
        if (output.banner && chunk.isEntry)
          js.text = [(await output.banner), js.text].join(host.getNewLine());

        // write declarations
        if (dts) writeOutputFile(project, dts);
        if (dtsmap) writeOutputFile(project, dtsmap);

        return {
          code: js.text,
          map: jsmap && jsmap.text,
        };
      } else {
        // TODO: _interopDefault -> __importDefault
      }
    },

    generateBundle(this: PluginContext, output: OutputOptions, bundle: OutputBundle) {
      // updates program by `checkProgramDirty` if any change occurs during transform
      const host = lazy2(cache, output, checkProgramDirty, this, outputHostKey, forkHostByOutput, output, project, compilerOptions);

      // remove all virtual / empty chunks
      for (const key of Object.keys(bundle))
        if (isExclude(bundle[key], exclude))
          delete bundle[key];

      // generate .d.ts bundle
      if (shouldBundleDts) {
        const outDir = path.resolve(path.dirname(output.file));
        const rel = path.relative(outDir, options.types);
        if (rel && !rel.startsWith("..")) {
          shouldBundleDts = false; // bundle once
          const {declarationDir} = project.options;
          const entry = path.join(declarationDir, rel);
          const relTypes = path.relative(process.cwd(), options.types);
          console.log(cyan(`${entry} → ${relTypes}`));
          addFileNames(host, collectDependencies(host, entry));
          bundleDts({
            entry,
            program: host.getProgram(),
            output: options.types,
          });
        }
      }
    },
  };
}

interface Has<T> {
  has(value: T): boolean;
}

function isExclude(chunk: OutputChunk | OutputAsset, ...excludes: Has<string>[]) {
  if (isOutputChunk(chunk))
    for (const exclude of excludes)
      if (exclude.has(chunk.facadeModuleId))
        return true;
}

function outputHostKey(output: OutputOptions): string {
  return `output.host.${output.file || output.dir}`;
}

function forkESNext<T extends ProjectHost>(host: T): T {
  const {ts} = host;
  return host.fork({
    options: {
      target: ts.ScriptTarget.ESNext,
    },
  });
}

function flush(host: ProjectHost, fileNames: Iterable<string>, dtsOnly: boolean) {
  const program = host.getProgram();
  for (const fileName of fileNames)
    writeEmit(host, emitByProgram(program, host, fileName, dtsOnly));
}

function showBundle(output: OutputOptions, bundle: OutputBundle) {
  console.group(cyan(output.file || output.dir));
  for (const key of Object.keys(bundle))
    console.log(bundle[key].fileName);
  console.groupEnd();
}

function isEmptyCode(code: string) {
  if (code) {
    code = code.replace(/\/\/.*/g, ""); // remove all "//" comments
    code = code.trim();
  }
  return !code;
}

function checkProgramDirty<T extends ProjectHost>(this: T) {
  this.checkProgramDirty();
}
