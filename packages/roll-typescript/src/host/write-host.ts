import { EmitOutput, OutputFile } from "typescript";
import { Emit } from "./emit-host";

export interface WriteHost {
  writeFile(fileName: string, content: string, writeByteOrderMark?: boolean): void;
}

export function writeEmit(host: WriteHost, output: Emit) {
  if (output && output.files)
    for (const file of output.files)
      writeOutputFile(host, file);
}

export function writeEmitOutput(host: WriteHost, output: EmitOutput) {
  if (output && output.outputFiles)
    for (const file of output.outputFiles)
      writeOutputFile(host, file);
}

export function writeOutputFile(host: WriteHost, file: OutputFile) {
  host.writeFile(file.name, file.text, file.writeByteOrderMark);
}
