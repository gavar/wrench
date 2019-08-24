import { Package } from "@wrench/semantic-release";
import { readFile } from "fs";
import { join } from "path";
import { promisify } from "util";

const readFileAsync = promisify(readFile);

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
