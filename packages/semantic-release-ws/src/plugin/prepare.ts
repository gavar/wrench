import { PrepareContext } from "@wrench/semantic-release";
import { WsConfiguration } from "../types";
import { callWorkspacesOf } from "../util";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export async function prepare(config: WsConfiguration, context: PrepareContext) {
  return callWorkspacesOf("prepare", context);
}
