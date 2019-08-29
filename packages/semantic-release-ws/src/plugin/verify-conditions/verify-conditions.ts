import { VerifyConditionsContext } from "@wrench/semantic-release";
import { projects } from "../../process";
import { WsConfiguration } from "../../types";
import { callWorkspaces } from "../../util";
import { configureWorkspaces } from "./configure-workspaces";
import { resolveWorkspaces } from "./resolve-workspaces";
import { verifyYarn } from "./verify-yarn";

export async function verifyConditions(config: WsConfiguration, context: VerifyConditionsContext) {
  await verifyYarn();

  const {cwd, logger} = context;
  const workspaces = await resolveWorkspaces(config, context);
  projects[cwd] = {cwd, workspaces};

  if (workspaces.length) logger.info(workspaces.length, "workspaces found for publishing");
  else return void logger.warn("no workspaces eligible for publishing found");
  await configureWorkspaces(config, context, workspaces);

  return callWorkspaces("verifyConditions", context, workspaces);
}
