import { Package, PackageDirectories } from "../types";
import { dirname } from "./path";

/**
 * Configure default directory structure form the package values.
 * @param main - {@link Package#main}
 */
export function defaultPackageDirectories({main}: Package): PackageDirectories {
  return {
    src: "src",
    cli: "cli",
    lib: dirname(main) || "lib",
    bin: "bin",
    tmp: "tmp",
  };
}
