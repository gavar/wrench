import { cyan, gray, green, magenta, red, yellow } from "colors";
import fs from "fs";
import { get, keyBy } from "lodash";
import Module from "module";
import path from "path";
import semver from "semver";
import { CopycatPackage, CopycatPackageProps, DependencyGroupType, Package, PackageRepository } from "./types";

/** Registry of package node process by the program. */
export interface PackRegistry {
  /** Get or set package node by {@link PackNode#filename}. */
  [filename: string]: PackNode;
}

export interface PackNode {
  /** Raw contents of the package. */
  raw: string;
  /** Package contents, which may have modifications. */
  pack: Package;
  /** Properties to process. */
  props: CopycatPackageProps;
  /** Path to a package file. */
  filename: string;
  /** Whether package was already visited or not. */
  visited?: boolean;
  /** Require function configured to resolve imports from {@link filename}. */
  importer: NodeRequire;
}

export interface CopycatPackagesOptions {

}

/**
 * Visit each package defined by filenames to update its properties.
 * @param filenames - array of package paths to check.
 * @param options - configurations.
 */
export function copycatPackages(filenames: string[], options?: Partial<CopycatPackagesOptions>) {
  // initialize registry
  const registry: PackRegistry = keyBy(filenames.map(createNode), "filename");
  const nodes = Object.values(registry);

  // visit nodes
  for (const node of nodes)
    visit(node, registry);

  // persist changes
  console.log();
  persist(nodes.filter(stringify));
}

/**
 * Create new instance of the {@link PackNode}.
 * @param filename - path to a package.
 */
function createNode(filename: string): PackNode {
  filename = path.resolve(filename);
  const raw = fs.readFileSync(filename).toString();
  const pack = JSON.parse(raw) as CopycatPackage;
  const importer = Module.createRequire(filename);
  return {
    filename,
    pack,
    props: pack.copycat,
    importer,
    raw,
  };
}

/**
 * Visit package if not yet visited.
 * @param node - package to visit.
 * @param registry - registry of all packages.
 * @return updated package by the given path.
 */
function visit(node: PackNode, registry: PackRegistry): void {
  if (node.visited) return;
  node.visited = true;

  if (node.props) {
    console.group(cyan(node.pack.name), gray(node.filename));
    updatePackage(node, registry);
    console.groupEnd();
  }
}

type ProcessorRegistry = {
  [K in keyof CopycatPackageProps]?: PropertyProcessor<K>
}

interface PropertyProcessor<K extends keyof CopycatPackageProps> {
  (node: PackNode, registry: PackRegistry, key: K): void;
}

const processors: ProcessorRegistry = {
  repository: processRepository,
  dependencies: processDependencyGroup,
  devDependencies: processDependencyGroup,
  peerDependencies: processDependencyGroup,
};

/**
 * Update package contents depending on {@link CopycatPackageProps}.
 * @param node - package to visit.
 * @param registry - registry of all packages.
 * @return true if any property has been modified.
 */
function updatePackage<K extends keyof ProcessorRegistry>(node: PackNode, registry: PackRegistry) {
  for (const key of Object.keys(node.props) as K[])
    ((processors[key] || processPrimitive) as PropertyProcessor<K>)(node, registry, key);
}

/**
 * Update dependencies of the package by copying versions from other packages..
 * @param node - package to process.
 * @param registry - registry of all packages.
 * @param type - to of dependency group to process.
 */
function processDependencyGroup(node: PackNode, registry: PackRegistry, type: DependencyGroupType): void {
  const group = node.props[type];
  if (group)
    for (const dependency of Object.keys(group)) {
      const source = resolve(node.importer, registry, group[dependency]);
      const version = resolveVersion(source.pack, dependency);
      if (version) {
        node.pack[type] = node.pack[type] || {};
        node.pack[type][dependency] = version;
        logResolve(type, `${dependency}@${version}`, source);
      } else {
        throwMissing("dependency", dependency, source);
      }
    }
}

function processRepository(node: PackNode, registry: PackRegistry) {
  let repository = node.props.repository;
  if (repository) {
    const key = "repository";
    const {importer, pack} = node;

    // resolve
    if (typeof repository === "string")
      repository = resolveValue(importer, registry, repository, key);
    else if (typeof repository === "object")
      repository = resolveObject(importer, registry, repository, key);

    // merge
    if (typeof repository === "object")
      repository = Object.assign(repositoryToObject(pack.repository), repository);

    // apply
    pack.repository = repository;
  }
}

function processPrimitive(node: PackNode, registry: PackRegistry, key: keyof CopycatPackageProps) {
  node.pack[key] = resolveValue(node.importer, registry, node.props[key] as string, key);
}

function repositoryToObject(repository: string | PackageRepository): PackageRepository {
  return typeof repository === "string"
    ? {url: repository}
    : repository || {};
}

function resolve(importer: NodeRequire, registry: PackRegistry, id: string): PackNode {
  // append `package.json` if required
  if (!path.extname(id))
    id = path.join(id, "package.json");

  const filename = importer.resolve(id);
  const node = registry[filename] = registry[filename] || createNode(filename);
  visit(node, registry);
  return node;
}

function resolveValue(importer: NodeRequire, registry: PackRegistry, from: string, path: string | string[]) {
  const source = resolve(importer, registry, from);
  const value = get(source.pack, path, null);
  const propertyPath = Array.isArray(path) ? path.join(".") : path;
  if (value === null)
    return throwMissing("property", propertyPath, source);

  logResolve(propertyPath, value, source);
  return value;
}

function resolveObject<T>(importer: NodeRequire, registry: PackRegistry, object: T, ...path: string[]): T {
  const out: any = {};
  path = path.concat(null);
  for (const key of Object.keys(object)) {
    path[path.length - 1] = key;
    const from = object[(key as keyof T)] as unknown as string;
    out[key] = resolveValue(importer, registry, from, path);
  }
  return out;
}

/**
 * Find version of the dependency in the given package.
 * @param pack - package containing dependency.
 * @param dependency - name of dependency to search for.
 * @return string - dependency version.
 */
function resolveVersion(pack: Package, dependency: string): string {
  if (pack) {
    // get version of the package if requested name match resolved package name.
    if (pack.name === dependency) {
      const v = semver.parse(pack.version);
      if (v.prerelease && v.prerelease.length)
        v.prerelease = [v.prerelease[0]];
      v.build = null;
      return ">=" + v.format();
    }
    // get any defined version
    return pack.dependencies && pack.dependencies[dependency]
      || pack.peerDependencies && pack.peerDependencies[dependency]
      || pack.commonDependencies && pack.commonDependencies[dependency]
      || pack.devDependencies && pack.devDependencies[dependency];
  }
}

function persist(nodes: PackNode[]) {
  if (nodes && nodes.length) {
    console.group(yellow("Writing changes"));
    for (const node of nodes) {
      console.log(">>", cyan(node.pack.name), gray(node.filename));
      fs.writeFileSync(node.filename, node.raw + "\n");
    }
  } else {
    console.log("Packages are up to date!");
  }
}

function stringify(node: PackNode): boolean {
  const {raw} = node;
  node.raw = JSON.stringify(node.pack, null, 2);
  return raw !== node.raw;
}

function logResolve(property: string, value: string, where: PackNode) {
  console.log("import", green(property), magenta(value), "from", cyan(where.pack.name), gray(where.filename));
}

function throwMissing(what: string, property: string, where: PackNode): never {
  return terminate(what, yellow(property), "not provided by", cyan(where.pack.name), gray(where.filename));
}

function terminate(...params: any[]): never {
  const message = params.join(" ");
  console.error(red(message));
  return process.exit(1);
}
