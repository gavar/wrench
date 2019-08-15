import { yarn } from "../../util";

export async function verifyYarn(): Promise<void> {
  if (!yarn.is())
    throw new Error("Yarn is required: https://yarnpkg.com/en/docs/install");
}
