import { DependencyNode } from "./types";

export interface FlattenDependencyGraph {
  depth?: number;
  dev?: boolean;
}

interface Context {
  dev: boolean;
  buffer: DependencyNode[];
  visits: Record<string, boolean>;
}

export function flattenDependencyGraph<T>(roots: DependencyNode[], options?: FlattenDependencyGraph): DependencyNode[] {
  options = options || {};
  let {depth, dev} = options;
  if (depth == null) depth = Number.POSITIVE_INFINITY;

  const context: Context = {dev, buffer: [], visits: {}};
  for (const root of roots)
    dfs(root, depth, context);
  return context.buffer;
}

function dfs(node: DependencyNode, distance: number, context: Context) {
  if (enter(node, distance--, context)) {
    dfsDependencyGroup(node, distance, context, node.dependencies);
    dfsDependencyGroup(node, distance, context, context.dev && node.devDependencies);
  }
}

function dfsDependencyGroup(node: DependencyNode, distance: number, context: Context, group: DependencyNode[]) {
  if (group && group.length)
    for (const dependency of group)
      dfs(dependency, distance, context);
}

function enter(node: DependencyNode, distance: number, {visits, buffer}: Context): boolean {
  if (distance >= 0 && !visits[node.filename]) {
    visits[node.filename] = true;
    buffer.push(node);
    return true;
  }
}
