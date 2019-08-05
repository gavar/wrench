import { InputOptions, OutputBundle, OutputOptions, Plugin, PluginContext } from "rollup";
import { bundleDts } from "./bundle-dts";
import { addFileNames, collectDependencies, TypeScript } from "./host";
import { Project } from "./project";
import { isOutputChunkWithId, lazy } from "./util";

const NAME = "@wrench/typescript-dts";
const NULL_NAME = `\0${NAME}`;
const EXPORT_NULL = "exports = null;";

export interface TypeScriptDtsBundleOptions {
  /**
   * TypeScript module instance to use.
   * @default `require("typescript")`
   */
  typescript?: typeof import("typescript");
}

export function typescriptDts(options?: TypeScriptDtsBundleOptions): Plugin {
  // defaults
  options = {...options};

  let entry: string;
  let project: Project;

  return {
    name: NAME,

    options(input: InputOptions) {
      if (typeof input.input === "string") entry = input.input;
      else throw new Error("input should be a single file!");
      return null;
    },

    buildStart(this: PluginContext, input: InputOptions) {
      project = lazy(this, "project", createProject, options);
      const dependencies = collectDependencies(project, input.input as string);
      addFileNames(project, dependencies);
    },

    resolveId(specifier: string, importer: string) {
      ensureDeclarationFileName(importer || specifier);
      return NULL_NAME;
    },

    async load(this: PluginContext, id: string) {
      if (id === NULL_NAME)
        return EXPORT_NULL;
    },

    generateBundle(this: PluginContext, output: OutputOptions, bundle: OutputBundle) {
      for (const key of Object.keys(bundle))
        if (isOutputChunkWithId(bundle[key], NULL_NAME))
          delete bundle[key];

      bundleDts({
        entry,
        program: project.getProgram(),
        output: output.file,
      });
    },
  };
}

function ensureDeclarationFileName(fileName: string) {
  if (!fileName.endsWith(".d.ts"))
    throw new Error("should only contain '.d.ts.' files, but found: " + fileName);
}

function createProject(options: TypeScriptDtsBundleOptions): Project {
  const ts: TypeScript = options.typescript || require("typescript");
  return new Project({
    ts,
    options: {
      ...ts.getDefaultCompilerOptions(),
      allowJs: false,
      sourceMap: false,
      declaration: true,
    },
  });
}

