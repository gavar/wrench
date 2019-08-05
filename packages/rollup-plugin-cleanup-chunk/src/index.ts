import { PluginHooks, PluginContext, RenderedChunk, SourceDescription } from "rollup";
import { Options as BaseOptions } from "rollup-plugin-cleanup";

export interface Options extends BaseOptions {
  /**
   * Whether to apply cleaning while {@link PluginHooks.transform}.
   * @default true.
   */
  transform?: boolean;

  /**
   * Whether to apply cleaning while {@link PluginHooks.renderChunk} hook.
   * @default false
   */
  renderChunk?: boolean;
}

/**
 * Default options of {@link Options}.
 */
const defaults: Options = {
  transform: true,
};

/**
 * Apply extra configuration over `rollup-plugin-cleanup` plugin.
 * @param options - configuration options.
 */
export default function cleanup(options: Options) {
  options = Object.assign({}, defaults, options);
  const plugin = require("rollup-plugin-cleanup")(options);

  const {transform} = plugin;
  if (!options.transform)
    delete plugin.transform;

  if (options.renderChunk)
    plugin.renderChunk = function (this: PluginContext, code: string, chunk: RenderedChunk) {
      return transform.call(this, code, chunk.facadeModuleId) as Promise<SourceDescription>;
    };

  return plugin;
}
