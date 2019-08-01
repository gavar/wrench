import { PluginContext, RenderedChunk, SourceDescription } from "rollup";
import source, { Options } from "rollup-plugin-cleanup";

export interface CleanOptions extends Options {
  /**
   * Whether to apply cleaning while {@link PluginHooks.transform}.
   * @default true.
   */
  useTransform?: boolean;

  /**
   * Whether to apply cleaning while {@link PluginHooks.renderChunk} hook.
   * @default false
   */
  useRenderChunk?: boolean;
}

/**
 * Apply extra configuration over `rollup-plugin-cleanup` plugin.
 * @param options - configuration options.
 */
export function clean(options: CleanOptions) {
  // defaults
  options = {
    useTransform: true,
    ...options,
  };

  const {useTransform, useRenderChunk, ...rest} = options;
  const plugin = source(rest);
  const {transform} = plugin;

  if (!useTransform)
    delete plugin.transform;

  if (useRenderChunk)
    plugin.renderChunk = function (this: PluginContext, code: string, chunk: RenderedChunk) {
      return transform.call(this, code, chunk.facadeModuleId) as Promise<SourceDescription>;
    };

  return plugin;
}
