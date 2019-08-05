import { PluginContext } from "rollup";
import { Diagnostic, FormatDiagnosticsHost } from "typescript";
import { reportDiagnosticByPlugin } from "../util";
import { TypeScriptHost } from "./typescript-host";

/** Diagnostic reporting host. */
export interface ReportHost {
  /**
   * Report diagnostic message.
   * @param diagnostic - message to report.
   */
  reportDiagnostic(diagnostic: Diagnostic): void;
}

/**
 * Creates reporting function that reports diagnostics errors to {@link PluginContext}.
 * @param plugin - plugin context to report to.
 */
export function createReportDiagnosticByPlugin(plugin: PluginContext) {
  return function reportDiagnostic(this: TypeScriptHost & FormatDiagnosticsHost, diagnostic: Diagnostic): void {
    reportDiagnosticByPlugin(diagnostic, this, plugin);
  };
}

/**
 * Report multiple diagnostic messages via {@link ReportHost}.
 * @param host - host to report into if any diagnostic message.
 * @param diagnostics - array of diagnostic messages to report.
 */
export function reportDiagnostics(host: ReportHost, diagnostics: readonly Diagnostic[] | undefined) {
  if (diagnostics && diagnostics.length)
    for (const diagnostic of diagnostics)
      host.reportDiagnostic(diagnostic);
}
