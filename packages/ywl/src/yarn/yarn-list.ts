import cp from "child_process";
import { promisify } from "util";

const exec = promisify(cp.exec);

export interface YarnList {
  name: string;
  children?: YarnList[];
}

export interface YarnListOptions {
  depth?: number;
  pattern?: string;
}

export async function yarnList(options: YarnListOptions): Promise<YarnList[]> {
  const {depth, pattern} = options;
  const args = ["yarn", "list", "--json"];
  if (depth != null) args.push(`--depth=${depth}`);
  if (pattern != null) args.push(`--pattern "${pattern}"`);
  const raw = await exec(args.join(" "));
  const json = JSON.parse(raw.stdout);
  const nodes: YarnList[] = json.data.trees;
  return nodes.map(reduce);
}

function reduce(node: YarnList): YarnList {
  const item: YarnList = {name: node.name};
  if (node.children && node.children.length)
    item.children = node.children.map(reduce);
  return item;
}

export function yarnListNames(nodes: YarnList[]): string[] {
  const visits = new Set<string>();
  nodes.forEach(visit, visits);
  return Array.from(visits);
}

function visit(this: Set<string>, node: YarnList) {
  const at = node.name.lastIndexOf("@");
  const name = node.name.slice(0, at);
  if (!this.has(name) && this.add(name))
    if (node.children)
      node.children.forEach(visit, this);
}
