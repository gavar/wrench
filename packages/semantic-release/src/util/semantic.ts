import cosmiconfig from "cosmiconfig";
import path from "path";

const CONFIG_NAME = "release";
const CONFIG_FILES = [
  "package.json",
  `.${CONFIG_NAME}rc`,
  `.${CONFIG_NAME}rc.json`,
  `.${CONFIG_NAME}rc.yaml`,
  `.${CONFIG_NAME}rc.yml`,
  `.${CONFIG_NAME}rc.js`,
  `${CONFIG_NAME}.config.js`,
];

export async function isOwnReleaseConfig(cwd: string): Promise<boolean> {
  const res = await cosmiconfig(CONFIG_NAME, {searchPlaces: CONFIG_FILES}).search(cwd);
  const dir = res && res.filepath && path.dirname(res.filepath);
  return dir === cwd;
}
