import { ChangelogConfig } from "@wrench/semantic-release-changelog";
import { GitConfig } from "@wrench/semantic-release-git";
import { NotesGeneratorConfig } from "@wrench/semantic-release-notes-generator";
import { NpmConfig } from "@wrench/semantic-release-npm";
import { WsConfiguration } from "@wrench/semantic-release-ws";

type Props =
  & GitConfig
  & NotesGeneratorConfig
  & ChangelogConfig
  & NpmConfig
  ;

export type PresetConfiguration = WsConfiguration<Props>;

export interface PresetOptions {
  base?: Partial<PresetConfiguration>;
}

export function npm(options?: PresetOptions): Partial<PresetConfiguration> {
  // defaults
  options = {
    base: {workspace: {}},
    ...options,
  };

  const conf: Partial<PresetConfiguration> = {
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
