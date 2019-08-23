import { TS_NODE_HOOK } from "./ts-node";
import { LoaderRegistry } from "./types";

export const loaders: LoaderRegistry = {
  "*": ["source-map-support/register"],
  ".ts": TS_NODE_HOOK,
  ".tsx": TS_NODE_HOOK,
};
