import { Async } from "@emulsy/async";
import {
  AnalyzeCommitsContext,
  Context,
  ContextType,
  Options,
  PluginReturnType,
  PluginsFunction,
  PluginsReturnType,
  PrepareContext,
  Step,
  SuccessContext,
} from "@wrench/semantic-release";
import { pick } from "lodash";
import path from "path";
import { projectByContext } from "../process";
import { Workspace } from "../types";

const DEBUG = false;

export interface WorkspacesHooks<S extends Step> extends WorkspaceHooks<S> {
  preProcessWorkspaces?(
    workspaces: Workspace[],
    owner: ContextType[S]): Async;

  processWorkspacesOutputs?(
    outputs: PluginsReturnType<S>[],
    workspaces: Workspace[],
    owner: ContextType[S]): Async<PluginReturnType<S>>;

  postProcessWorkspaces?(
    workspaces: Workspace[],
    outputs: PluginsReturnType<S>[],
    output: PluginReturnType<S>,
    owner: ContextType[S]): Async;
}

export async function callWorkspacesOf<S extends Step>(
  step: S,
  owner: ContextType[S],
  hooks?: WorkspacesHooks<S>,
): Promise<PluginReturnType<S>> {
  const {workspaces} = projectByContext(owner);
  return callWorkspaces(step, owner, workspaces, hooks);
}

export async function callWorkspaces<S extends Step>(
  step: S,
  owner: ContextType[S],
  workspaces: Workspace[],
  hooks?: WorkspacesHooks<S>,
): Promise<PluginReturnType<S>> {
  if (workspaces) workspaces = workspaces.filter(w => shouldCallWorkspace(w, step));
  const length = workspaces && workspaces.length || 0;

  // process workspaces
  const outputs = new Array(length);
  for (let i = 0; i < length; i++)
    outputs[i] = await callWorkspace(step, owner, workspaces[i], hooks);

  // process outputs
  let output: PluginReturnType<S>;
  if (hooks && hooks.processWorkspacesOutputs)
    output = await hooks.processWorkspacesOutputs(outputs, workspaces, owner);

  // post-process hook
  if (hooks && hooks.postProcessWorkspaces)
    await hooks.postProcessWorkspaces(workspaces, outputs, output, owner);

  return output;
}

export interface WorkspaceHooks<S extends Step> {
  preProcessWorkspace?(
    workspace: Workspace,
    owner: ContextType[S]): Async;

  processWorkspaceOutput?(
    output: PluginsReturnType<S>,
    workspace: Workspace,
    owner: ContextType[S],
  ): Async<PluginsReturnType<S>>;

  postProcessWorkspace?(
    workspace: Workspace,
    output: PluginsReturnType<S>,
    owner: ContextType[S],
  ): Async;
}

export async function callWorkspace<S extends Step>(
  step: S,
  owner: ContextType[S],
  workspace: Workspace,
  hooks?: WorkspaceHooks<S>,
): Promise<PluginsReturnType<S>> {
  if (!shouldCallWorkspace(workspace, step)) return;
  if (DEBUG) owner.logger.start(`start step "${step}" for workspace: ${workspace.name}`);

  // pre-process hook
  if (hooks && hooks.preProcessWorkspace)
    await hooks.preProcessWorkspace(workspace, owner);

  // call workspace plugin
  const context = createWorkspaceContext(workspace, owner);
  let output = await (workspace.plugins[step] as PluginsFunction<S>)(context);

  // process output
  if (hooks && hooks.processWorkspaceOutput)
    output = await hooks.processWorkspaceOutput(output, workspace, owner);

  // post-process hook
  if (hooks && hooks.postProcessWorkspace)
    await hooks.postProcessWorkspace(workspace, output, owner);

  if (DEBUG) owner.logger.complete(`complete step "${step}" for workspace: ${workspace.name}`);
  return output;
}

export function createWorkspace(root: Context, name: string, relative: string): Workspace {
  const cwd = path.join(root.cwd, relative);
  return {cwd, name} as Workspace;
}

const workspaceToContextKeys: Array<keyof Workspace & keyof SuccessContext> = [
  "cwd",
  "branch",
  "branches",
  "commits",
  "lastRelease",
  "nextRelease",
];

export function createWorkspaceContext<T extends Context>(w: Workspace, owner: T, options: Options = w.options): T {
  const context = {
    ...owner,
    ...pick(w, ...workspaceToContextKeys),
    options,
  } as T & AnalyzeCommitsContext & PrepareContext;
  context.logger = createWorkspaceLogger(w, owner);
  return context;
}

export function createWorkspaceLogger(w: Workspace, owner: Context) {
  return owner.logger.scope(w.name);
}

export function shouldCallWorkspace(w: Workspace, step: Step) {
  switch (step) {
    case "verifyRelease":
      // allow to run this step without relevant changes
      // since this is the first step containing next release essential props
      // required to resolve release for workspaces
      break;
    case "generateNotes":
    case "prepare":
    case "publish":
    case "success":
      // only when contains relevant changes
      return !!w.nextRelease.type;
  }
  // always allow other steps
  return true;
}
