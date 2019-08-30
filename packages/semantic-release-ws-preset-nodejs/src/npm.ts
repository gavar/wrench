import { GitConfig } from "@wrench/semantic-release-git";
import { NpmConfig } from "@wrench/semantic-release-npm";
import { WsConfiguration } from "@wrench/semantic-release-ws";

export interface NodeJsPresetOptions {
  base?: Partial<NodeJsPresetConfig>;
}

export type NodeJsPresetConfig = WsConfiguration<NpmConfig & GitConfig>;

export function npm(options?: NodeJsPresetOptions): Partial<NodeJsPresetConfig> {
  // defaults
  options = {
    base: {workspace: {}},
    ...options,
  };

  const conf: Partial<NodeJsPresetConfig> = {
    git: true,
    npmPublish: true,
    assets: [[
      "**/package.json",
      "**/CHANGELOG.md",
      "!**/node_modules/**",
    ]],
    tagFormat: "#/${version}",
    plugins: [
      "@wrench/semantic-release-ws",
      "@wrench/semantic-release-git",
    ],
    ...options.base,
  };

  conf.workspace = {
    git: conf.git,
    npmPublish: conf.npmPublish,
    tarballDir: "out",
    plugins: [
      "@semantic-release/commit-analyzer",
      "@wrench/semantic-release-notes-generator",
      "@wrench/semantic-release-changelog",
      "@wrench/semantic-release-npm",
    ],
    ...conf.workspace,
  };

  return conf;
}
