import { WsConfiguration } from "@wrench/semantic-release-ws";

const git = false;
const npmPublish = false;

export default {
  git,
  npmPublish,
  assets: [[
    "**/package.json",
    "**/CHANGELOG.md",
    "!**/node_modules/**",
  ]],
  tagFormat: "v/release/${version}",
  plugins: [
    "@wrench/semantic-release-ws",
    "@wrench/semantic-release-git",
  ],
  workspace: {
    git,
    npmPublish,
    tarballDir: "out",
    plugins: [
      "@semantic-release/commit-analyzer",
      "@semantic-release/release-notes-generator",
      "@semantic-release/changelog",
      "@wrench/semantic-release-npm",
    ],
  },
} as Partial<WsConfiguration>;
