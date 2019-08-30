import { Tag } from "../types";

/**
 * Sort tags list by order defined in an object.
 * @param tags - list of tags to sort.
 * @param order - object defining tags order, where key is tag name.
 */
export function sortTagsByOrder<T extends Tag>(tags: T[], order: Record<string, number>): T[] {
  return tags.sort((a, b) => order[a.gitTag] - order[b.gitTag]);
}

