import { Package } from "@wrench/semantic-release";
import { readFile } from "fs";
import { join } from "path";
import { promisify } from "util";

const readFileAsync = promisify(readFile);

export interface NpmConfig {
  pkgRoot: string;
  npmPublish: boolean;
  tarballDir: string;
  /**
   * Tells the registry whether this package should be published as public or restricted.
   * @see https://docs.npmjs.com/cli/publish#description
   */
  access: "public" | "restricted";
}

export async function readPack(cwd: string): Promise<Package> {
  const text = await readFileAsync(join(cwd, "package.json"));
  return JSON.parse(text.toString());
}

export function resolveTarballName(name: string, version: string): string {
  return ([
    name.startsWith("@")
      ? name.slice(1).split("/")
      : name,
    version,
  ]).flat().join("-") + ".tgz";
}
