import { clean, valid } from "semver";
import { Tag } from "../types";

/**
 * Sort tags list by order defined in an object.
 * @param tags - list of tags to sort.
 * @param order - object defining tags order, where key is tag name.
 */
export function sortTagsByOrder<T extends Tag>(tags: T[], order: Record<string, number>): T[] {
  return tags.sort((a, b) => order[a.gitTag] - order[b.gitTag]);
}

/**
 * Parse tags that match provided format.
 * @param tags - tags to parse.
 * @param format - format to match.
 * @param tagsRefs - object containing tag head by a tag name.
 */
export function parseTags(tags: string[], format: string, tagsRefs: Record<string, string>): Tag[] {
  const values: Tag[] = [];
  const pattern = "^" + format.replace("${version}", "(.[^@]+)@?(.+)?");
  const regex = new RegExp(pattern);
  for (const tag of tags) {
    const ref = tagsRefs[tag];
    const value = parseTag(tag, ref, regex);
    if (value) values.push(value);
  }
  return values;
}

function parseTag(gitTag: string, gitHead: string, regex: RegExp): Tag {
  let [, version, channel] = gitTag.match(regex) || [];
  version = version && clean(version);
  version = version && valid(version);
  if (version)
    return {gitTag, gitHead, version, channel};
}
