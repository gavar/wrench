import { Commit, GenerateNotesContext, ownCommits, Plugin, Release, Tag } from "@wrench/semantic-release";
import { identity } from "lodash";
import { compare } from "semver";
import { Signale } from "signale";
import { lazyHistory } from "./history";
import { NotesGeneratorConfig } from "./types";

const generator: Plugin<NotesGeneratorConfig> = require("@semantic-release/release-notes-generator");

export function generateNotes(config: NotesGeneratorConfig, context: GenerateNotesContext): Promise<string> {
  return config.regenerateNotes
    ? regenerateNotes(config, context)
    : generator.generateNotes(config, context);
}

async function regenerateNotes(config: NotesGeneratorConfig, context: GenerateNotesContext): Promise<string> {
  context = {...context};
  const {logger} = context;
  const history = await lazyHistory(context.logger);
  const commits = ownCommits(history, context.cwd);

  let tags = [...context.branch.tags, context.nextRelease];
  tags = tags.filter(tag => belongsToChannel(tag, context.nextRelease.channel));
  tags = tags.sort(compareTagVersion);
  tags = tags.slice(0, tags.indexOf(context.nextRelease) + 1);

  let last = {} as Release;
  let end = commits.length;
  const promises: Promise<string>[] = [];
  for (const tag of tags) {
    const prev = context.lastRelease = last;
    const next = context.nextRelease = tag as Release;
    const start = lastIndexOfCommitByTag(commits, tag, end - 1, 0);
    context.commits = commits.slice(start, end);
    const promise = generator.generateNotes(config, context)
      .then(x => trimEmptyChangeSet(x, prev, next, logger));
    promises.push(promise);

    last = next;
    end = start;
  }

  const notes = await Promise.all(promises);
  return notes.filter(identity).reverse().join("");
}

function belongsToChannel(tag: Tag, channel: string) {
  return tag.channel == null || tag.channel === channel;
}

function compareTagVersion(a: Tag, b: Tag) {
  return compare(a.version, b.version);
}

function lastIndexOfCommitByTag(commits: Commit[], tag: Tag, from: number = commits.length - 1, defaultValue: number = -1): number {
  if (tag && tag.gitHead)
    for (let i = from; i >= 0; i--)
      if (commits[i].hash === tag.gitHead)
        return i;
  return defaultValue;
}

function trimEmptyChangeSet(changes: string, from: Tag, to: Tag, logger: Signale): string {
  // consider empty if changelog has only single header line
  if (changes.trim().split("\n").length <= 1) {
    logger.warn("[", formatTag(from), "...", formatTag(to), "] has empty changelog");
    changes = "";
  }
  return changes;
}

function formatTag(tag: Tag): string {
  if (tag) {
    if (tag.gitTag) return tag.gitTag;
    if (tag.gitHead) return tag.gitHead.slice(0, 7);
  }
  return "";
}
