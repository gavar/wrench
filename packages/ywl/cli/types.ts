import { Package } from "@wrench/ywl";

export interface YwlProps {
  /** Path to yarn root containing workspaces configuration. */
  root: string;

  /** Package contents of the `package.json` located in {@link root}. */
  pack: Package;
}
