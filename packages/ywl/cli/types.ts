import { Package } from "@wrench/ywl";

export interface YwlProps {
  /**
   * Ywl links output directory.
   * @default ".ywl"
   */
  out: string;

  /** Path to yarn root containing workspaces configuration. */
  root: string;

  /** Package contents of the `package.json` located in {@link root}. */
  pack: Package;
}
