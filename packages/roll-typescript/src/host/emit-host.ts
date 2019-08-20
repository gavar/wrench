import { pick } from "lodash";
import { CustomTransformers, OutputFile, Program, SourceFile } from "typescript";
import { extname } from "../util";
import { reportDiagnostics, ReportHost } from "./report-host";
import { TypeScriptHost } from "./typescript-host";

export interface Emit {
  fileName: string;
  sourceFile: SourceFile;
  files: OutputFile[];
  js?: OutputFile;
  dts?: OutputFile;
  jsmap?: OutputFile;
  dtsmap?: OutputFile;
}

type OverrideKey = Extract<keyof ProgramInternal, | "getCommonSourceDirectory">;
const overrides: Array<OverrideKey> = ["getCommonSourceDirectory"];

interface ProgramInternal extends Program {
  getCommonSourceDirectory(): string;
}

export interface EmitHost extends TypeScriptHost, ReportHost {
  transform?: CustomTransformers;
  getCommonSourceDirectory?(): string;
}

let current: Emit;

export function emitByProgram(program: Program, host: EmitHost, fileName: string, dtsOnly?: boolean): Emit {
  const {ts} = host;
  const emit: Emit = current = {
    fileName,
    sourceFile: program.getSourceFile(fileName),
    files: [],
  };
  if (emit.sourceFile) {
    const origin = pick(program as ProgramInternal, overrides);
    const injects = pick(host, overrides);
    Object.assign(program, injects);
    try {
      const r = program.emit(emit.sourceFile, writeFile, void 0, dtsOnly, host.transform);
      reportDiagnostics(host, r.diagnostics);
    } finally {
      Object.assign(program, origin);
    }
  } else {
    const template = ts.Diagnostics.File_0_not_found;
    const diagnostic = ts.createCompilerDiagnostic(template, fileName);
    host.reportDiagnostic(diagnostic);
  }
  return emit;
}

function writeFile(name: string, text: string, writeByteOrderMark: boolean) {
  const key = extname(name).toLowerCase().split(".").join("");
  const file = {name, text, writeByteOrderMark};
  current.files.push(file);
  (current as any)[key] = file;
}
