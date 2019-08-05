import { CompilerOptions, ModuleResolutionCache, ModuleResolutionHost } from "typescript";
import { ScriptText } from "./script-host";
import { TypeScriptHost } from "./typescript-host";

export interface ResolutionHost extends TypeScriptHost, ModuleResolutionHost {
  readonly moduleResolutionCache: ModuleResolutionCache;
  getCompilationSettings(): CompilerOptions;
  getCanonicalFileName(fileName: string): string;
  getScriptSnapshot(fileName: string): ScriptText;
}

export function resolve(host: ResolutionHost, importer: string, specifier: string, require?: boolean): string {
  const {ts} = host;
  const options = host.getCompilationSettings();
  const {resolvedModule} = ts.resolveModuleName(specifier, importer, options, host, host.moduleResolutionCache);
  if (resolvedModule) return host.getCanonicalFileName(resolvedModule.resolvedFileName);
  if (require) throw new Error(`unable to import '${specifier}' by ${importer}`);
}

export function collectDependencies(host: ResolutionHost, entry: string | Iterable<string>, scriptOnly?: boolean): string[] {
  const stack = typeof entry === "string" ? [entry] : Array.from(entry).flat();
  const visits = new Set<string>();
  while (stack.length) {
    const importer = host.getCanonicalFileName(stack.pop());
    if (!visits.has(importer) && visits.add(importer)) {
      const text = host.getScriptSnapshot(importer).text;
      const file = host.ts.preProcessFile(text, true, true);
      for (const {fileName} of file.importedFiles)
        if (fileName.startsWith(".")) {
          const r = resolve(host, importer, fileName, true);
          if (scriptOnly && r.endsWith(".d.ts")) continue;
          stack.push(r);
        }
    }
  }

  return [...visits];
}
