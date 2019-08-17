import { WsConfiguration } from "@wrench/semantic-release-ws";

export default {
  git: false,
  npmPublish: false,
  tagFormat: "v/release/${version}",
  plugins: ["@wrench/semantic-release-ws"],
  workspace: {
    git: false,
    tarballDir: "out",
    npmPublish: false,
    plugins: [
      "@semantic-release/commit-analyzer",
      "@semantic-release/release-notes-generator",
      "@semantic-release/changelog",
      "@wrench/semantic-release-npm",
    ],
  },
} as Partial<WsConfiguration>;
