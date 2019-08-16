import { getConfig, VerifyConditionsContext } from "@wrench/semantic-release";
import findUp from "find-up";
import { readFileSync } from "fs";
import yargs, { Arguments, Argv } from "yargs";
import { CommonOptions, Workspace, WsConfiguration } from "../../types";
import { createWorkspaceContext } from "../../util";

export async function configureWorkspaces(
  config: WsConfiguration,
  owner: VerifyConditionsContext,
  workspaces: Workspace[],
): Promise<Workspace[]> {
  const {packages} = config;

  // preserve original CLI options
  const argv = {...yargs.argv};

  // apply common options for all workspaces
  if (config.workspace)
    Object.assign(argv, config.workspace);

  // initialize workspace options and plugins
  for (const w of workspaces) {
    owner.logger.start("configuring workspace:", w.name);
    const context = createWorkspaceContext(w, owner, null);
    const options = Object.assign({}, argv, packages && packages[w.name]) as CommonOptions;
    Object.assign(w, await getConfig(context, options));
    if (w.options.tagFormat === "v${version}") {
      const args = resolveStandardVersionConfig(w);
      if (args.tagPrefix) w.options.tagFormat = args.tagPrefix + "${version}";
      else throw new Error(`workspace '${w.name}' does not provide own tag format`);
    }
  }
  return workspaces;
}

interface StandardVersionConfig {
  tagPrefix: string;
}

function resolveStandardVersionConfig(workspace: Workspace): Arguments<StandardVersionConfig> {
  const {cwd} = workspace;
  const configPath = findUp.sync([".versionrc", ".versionrc.json"], {cwd});
  const config = configPath ? JSON.parse(readFileSync(configPath).toString()) : {};
  return (yargs as Argv<StandardVersionConfig>)([], cwd)
    .pkgConf("standard-version")
    .config(config)
    .argv;
}


