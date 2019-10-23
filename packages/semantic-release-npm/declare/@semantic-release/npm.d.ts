declare module "@semantic-release/npm" {
  import { Plugin } from "@wrench/semantic-release";
  const plugin: Pick<Plugin, "verifyConditions" | "prepare" | "publish" | "addChannel">;
  export = plugin;
}
