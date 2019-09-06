import { ExecOptions } from "child_process";
import { asExecOptions, execAsync } from "./exec";

export namespace git {
  /**
   * Resolve files committed by the commit with specified hash.
   * @param hash - commit hash value.
   */
  export async function filesByCommit(hash: string): Promise<string[]> {
    const raw = await execAsync(`git diff-tree --no-commit-id --name-only -r ${hash}`);
    const rows = raw.stdout.split("\n");
    return rows.map(normalize);
  }
}

export interface GitTagsProps {
  /**
   * Name of the field to sort by.
   * @see https://git-scm.com/docs/git-for-each-ref#_field_names
   */
  sort?: string;
}

export async function gitTagsRefs(options?: ExecOptions): Promise<Record<string, string>> {
  options = asExecOptions(options);
  const command = "git show-ref --tags --dereference";
  const {stdout} = await execAsync(command, options);

  // 0000000000000000000000000000000000000000 refs/tags/your/tag/name/0.0.0^{}
  const regex = /^(\w+)\srefs\/tags\/(.+)\^/gim;
  const refs: Record<string, string> = {};
  let r: RegExpExecArray;
  while ((r = regex.exec(stdout)))
    refs[r[2]] = r[1];

  return refs;
}

export async function gitBranchTags(branch: string, options?: ExecOptions): Promise<string[]> {
  options = asExecOptions(options);
  const command = `git tag --merged ${branch}`;
  const {stdout} = await execAsync(command, options);
  return stdout.split("\n");
}

export async function gitTags({sort}: GitTagsProps = {}, options?: ExecOptions): Promise<string[]> {
  options = asExecOptions(options);
  const args = ["git", "tag"];
  if (sort) args.push(`--sort=${sort.toLowerCase()}`);
  const {stdout} = await execAsync(args.join(" "), options);
  return stdout.trim().split("\n");
}

export async function gitLogTagsOrder(options?: ExecOptions): Promise<Record<string, number>> {
  options = asExecOptions(options);
  const command = `git log --no-walk --tags --pretty="%D" --decorate=full`;
  const {stdout} = await execAsync(command, options);

  const order: Record<string, number> = {};
  const lines = stdout.trim().split("\n");
  for (let i = 0; i < lines.length; i++)
    for (const tag of lines[i].trim().split(", "))
      order[(tag.slice("tag: refs/tags/".length))] = i;

  return order;
}

function normalize(file: string): string {
  return file.trim().split("\\").join("/");
}
