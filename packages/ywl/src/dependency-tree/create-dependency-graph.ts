import { readFileSync } from "fs";
import { join, resolve } from "path";
import { DependencyGroup, Package } from "../types";
import { DependencyNode } from "./types";

const {Module} = require("module");

type PackRegistry = Record<string, PackEntry>;

interface PackEntry {
  /** Node instance containing resulting data. */
  node: DependencyNode;

  /** Package contents, which may have modifications. */
  pack: Package;

  /**
   * Whether package is a library imported from:
   * - node_modules
   */
  library: boolean;

  /** Whether node has been already visited. */
  visited?: boolean;

  /** Require function configured to resolve imports from {@link filename}. */
  importer: NodeRequireResolve;
}

export interface NodeRequireResolve extends NodeRequireFunction {
  resolve(id: string, options?: { paths?: string[]; }): string;
}

export interface CreateDependencyGraph {
  depth?: number;
  dev?: boolean;
}

interface Context {
  registry: PackRegistry;
  dev: boolean;
}

export function createDependencyGraph(dirs: string[], options?: CreateDependencyGraph): DependencyNode[] {
  options = options || {};
  let {depth, dev} = options;
  if (depth == null) depth = Number.POSITIVE_INFINITY;

  const context: Context = {dev, registry: {}};
  const roots = dirs.map(dir => createNode(join(dir, "package.json")));
  for (const root of roots)
    dfs(root, depth, context);

  return roots.map(x => x.node);
}

function dfs(entry: PackEntry, distance: number, context: Context): void {
  if (enter(entry, distance--)) {
    const {node, pack, importer} = entry;
    const dependencies = dfsDependencyGroup(importer, pack.dependencies, distance, context);
    const devDependencies = context.dev && !entry.library && dfsDependencyGroup(importer, pack.devDependencies, distance, context);
    if (dependencies) node.dependencies = dependencies;
    if (devDependencies) node.devDependencies = devDependencies;
  }
}

function dfsDependencyGroup(importer: NodeRequireResolve, group: DependencyGroup, distance: number, context: Context): DependencyNode[] {
  const ids = group && Object.keys(group);
  if (ids && ids.length)
    return ids.map(id => {
      const node = resolveNode(id, importer, context.registry);
      dfs(node, distance, context);
      return node.node;
    });
}

function createNode(filename: string): PackEntry {
  filename = slash(resolve(filename));
  const raw = readFileSync(filename).toString();
  const pack = JSON.parse(raw) as Package;
  const importer = createRequireResolve(filename);
  return {
    node: {
      name: pack.name,
      filename,
    },
    pack,
    importer,
    library: isLibrary(filename),
  };
}

function resolveNode(id: string, importer: NodeRequireResolve, registry: PackRegistry): PackEntry {
  const manifest = join(id, "package.json");
  const filename = slash(importer.resolve(manifest));
  return registry[filename] = registry[filename] || createNode(filename);
}

function enter(entry: PackEntry, distance: number): boolean {
  if (distance >= 0 && !entry.visited)
    return entry.visited = true;
}

function isLibrary(filename: string) {
  return filename.includes("/node_modules/");
}

function slash(value: string) {
  return value.split("\\").join("/");
}

function createRequireResolve(filename: string): NodeRequireResolve {
  const base = Module.createRequire(filename);

  const importer = function (id: string) {
    id = importer.resolve(id);
    return base(id);
  } as NodeRequireResolve;

  importer.resolve = function (id: string, options?: { paths?: string[]; }) {
    try {
      // search in modules of request source
      return base.resolve(id, options);
    } catch (e) {
      // search in own modules
      return require.resolve(id, options);
    }
  };

  return importer;
}
