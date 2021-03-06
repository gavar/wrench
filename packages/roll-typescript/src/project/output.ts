import path from "path";
import { OutputOptions } from "rollup";
import { CompilerOptions } from "typescript";
import { ProjectHost } from "../host";
import { formatToModule } from "../util";

/**
 * Create host for the particular output options.
 * @param host - project host transforming code.
 * @param output - output options.
 * @param options - base options.
 */
export function forkHostByOutput(output: OutputOptions, host: ProjectHost, options: CompilerOptions): ProjectHost {
  const dir = path.resolve(host.getCurrentDirectory(), output.dir || path.dirname(output.file));
  options = {
    ...options,
    outDir: dir,
    declarationDir: dir,
    inlineSources: false,
    inlineSourceMap: false,
    alwaysStrict: !!output.strict,
    esModuleInterop: !!output.interop,
    module: formatToModule(output.format, host),
    // TODO: wait for https://github.com/microsoft/TypeScript/pull/32083
    noEmitUnderscoreUnderscoreESModule: !!output.esModule,
    noImplicitUseStrict: !output.strict,
    sourceMap: !!output.sourcemap,
    strict: !!output.strict,
  };

  return host.fork({options});
}
