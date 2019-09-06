import { gitBranchTags, gitTagsRefs, VerifyConditionsContext } from "@wrench/semantic-release";
import { projects } from "../../process";
import { Project, WsConfiguration } from "../../types";
import { callWorkspaces } from "../../util";
import { configureWorkspaces } from "./configure-workspaces";
import { resolveWorkspaces } from "./resolve-workspaces";
import { verifyYarn } from "./verify-yarn";

export async function verifyConditions(config: WsConfiguration, context: VerifyConditionsContext) {
  await verifyYarn();

  const {cwd, logger} = context;
  await resolveWorkspaces(config, context);
  const {workspaces} = projects[cwd] = await configureProject(config, context);

  if (workspaces.length) logger.info(workspaces.length, "workspaces found for publishing");
  else return void logger.warn("no workspaces eligible for publishing found");
  await configureWorkspaces(config, context, workspaces);

  return callWorkspaces("verifyConditions", context, workspaces);
}

async function configureProject(config: WsConfiguration, context: VerifyConditionsContext): Promise<Project> {
  const {cwd} = context;
  const [workspaces, tagsRefs, branchTags] = await Promise.all([
    await resolveWorkspaces(config, context),
    await gitTagsRefs(context),
    await gitBranchTags(context.branch.name, context),
  ]);

  return {
    cwd,
    tagsRefs,
    workspaces,
    branchTags,
  };
}
