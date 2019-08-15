import { SuccessContext } from "@wrench/semantic-release";
import { WsConfiguration } from "../types";
import { callWorkspacesOf } from "../util";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export async function success(config: WsConfiguration, context: SuccessContext) {
  return callWorkspacesOf("success", context);
}
