import { EntryPointConfig, generateDtsBundle } from "dts-bundle-generator";
import path from "path";
import { Plugin, PluginContext, RenderedChunk } from "rollup";

const dts = /\.d.ts?$/;

/**{@link dtsBundleGenerator} plugin configuration options. */
export interface DtsBundleGeneratorOptions {
  /**
   * List of external libraries.
   * @see https://rollupjs.org/guide/en/#external
   */
  external: string[]
}

/**
 * Rollup plugin wrapping `dts-bundle-generator`.
 * @param options - configuration options.
 */
export function dtsBundleGenerator(options?: DtsBundleGeneratorOptions): Plugin {
  options = Object.assign({}, options);

  return {
    name: "dts-bundle-generator",

    resolveId(this: PluginContext, source: string, importer?: string) {
      return importer
        ? path.join(path.dirname(importer), source + ".d.ts")
        : source;
    },

    load(id: string) {
      // `dts-bundle-generator` operates on files and doesn't require code
      // so just return stub code to avoid `rollup` warnings
      if (dts.test(id))
        return {code: "export default {};"};
    },

    renderChunk(this: PluginContext, code: string, chunk: RenderedChunk) {
      const entry: EntryPointConfig = {
        filePath: chunk.facadeModuleId,
        libraries: {},
      };

      if (options.external)
        entry.libraries.allowedTypesLibraries = options.external
          .map(x => x.replace("@types/", ""));

      // create bundle
      const bundle = generateDtsBundle([entry]);
      code = bundle.join("\n");
      code = code.replace("export {};", "");
      code = code.trim();
      return {code, map: ""};
    },
  };
}
