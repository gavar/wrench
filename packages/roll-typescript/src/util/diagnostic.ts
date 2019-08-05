import { PluginContext, RollupLogProps } from "rollup";
import { Diagnostic, FormatDiagnosticsHost } from "typescript";
import { TypeScriptHost } from "../host";

/**
 * Report diagnostics to a {@link console}.
 * @param diagnostic - diagnostic message to report.
 * @param host - host defining format options.
 */
export function reportDiagnosticByConsole(diagnostic: Diagnostic,
                                          host: TypeScriptHost & FormatDiagnosticsHost): void {
  if (diagnostic) {
    const {ts} = host;
    const message = ts.formatDiagnosticsWithColorAndContext([diagnostic], host);
    if (diagnostic.category === ts.DiagnosticCategory.Error) return console.error(message);
    if (diagnostic.category === ts.DiagnosticCategory.Warning) return console.warn(message);
    return console.log(message);
  }
}

/**
 * Report diagnostics to a {@link PluginContext}.
 * @param diagnostic - diagnostic message to report.
 * @param host - host defining format options.
 * @param plugin - plugin context to report to.
 */
export function reportDiagnosticByPlugin(diagnostic: Diagnostic,
                                         host: TypeScriptHost & FormatDiagnosticsHost,
                                         plugin: PluginContext): void {
  if (diagnostic) {
    const props = diagnosticToLogProps(plugin, diagnostic, host);
    const error = diagnostic.category === host.ts.DiagnosticCategory.Error;
    if (error) plugin.error(props);
    else plugin.warn(props);
  }
}

function diagnosticToLogProps(context: PluginContext,
                              diagnostic: Diagnostic,
                              host: TypeScriptHost & FormatDiagnosticsHost): RollupLogProps {
  const props: RollupLogProps = {
    code: `TS${diagnostic.code}`,
    message: host.ts.formatDiagnostic(diagnostic, host),
  };

  const {start, file} = diagnostic;
  if (file && start > 0) {
    const {line, character} = file.getLineAndCharacterOfPosition(start);
    props.loc = {
      file: file.fileName,
      line: line + 1,
      column: character + 1,
    };
  }

  return props;
}
