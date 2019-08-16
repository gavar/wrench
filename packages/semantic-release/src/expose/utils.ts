const $ = require("semantic-release/lib/utils");

export function makeTag(tagFormat: string, version: string, channel?: string): string {
  return $.makeTag(tagFormat, version, channel);
}
