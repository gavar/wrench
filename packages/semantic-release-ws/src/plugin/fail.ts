import { Context } from "@wrench/semantic-release";
import { WsConfiguration } from "../types";
import { callWorkspacesOf } from "../util";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export async function fail(config: WsConfiguration, context: Context) {
  return callWorkspacesOf("fail", context);
}
