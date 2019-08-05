import { IScriptSnapshot, ScriptKind } from "typescript";

export interface ScriptText extends IScriptSnapshot {
  text: string;
  kind: ScriptKind,
  version?: string;
}
