import { PrepareContext } from "@wrench/semantic-release";
import { WsConfiguration } from "../types";
import { askToContinue, callWorkspacesOf, shouldAskToContinue } from "../util";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export async function prepare(config: WsConfiguration, context: PrepareContext) {
  const {logger} = context;
  const {dryRun} = context.options;

  await callWorkspacesOf("version", context);
  await callWorkspacesOf("pack", context);
  const outputs = await callWorkspacesOf("prepare", context);

  if (!dryRun && shouldAskToContinue(config)) {
    logger.complete("prepare is complete");
    logger.pending("!!! please make sure to check files before publishing !!!");
    await askToContinue("do you want to continue to publish step?");
  }
  return outputs;
}
