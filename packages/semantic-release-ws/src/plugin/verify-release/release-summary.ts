import Table, { CellOptions, CellValue, HorizontalTable } from "cli-table3";
import { Color, green, grey, magenta, yellow } from "colors";
import { Workspace } from "../../types";

/**
 * Show table of release summary per workspace.
 * @param workspaces - workspaces to include into a summary.
 */
export function releaseSummary(workspaces: Workspace[]): string {
  workspaces = [...workspaces];
  workspaces.sort((a, b) => a.name.localeCompare(b.name));

  const table = createTable();
  for (const w of workspaces) {
    const next = w.nextRelease;
    const last = w.lastRelease;
    const active = !!next.type;
    const $yellow = active ? yellow : grey;
    table.push([
      style(w.name, !active && grey),
      last.gitHead ? style(last.gitHead.slice(0, 7), $yellow) : "",
      last.version ? style(last.version, $yellow) : "",
      active ? style(next.version, green) : "",
      active ? style(w.commits.length, green) : "",
      active ? style(next.type, magenta) : "",
      active ? style(next.gitTag, green) : "",
    ]);
  }

  return table.toString();
}

function createTable(): HorizontalTable {
  return new Table({
    head: ["Name", "Commit", "Version", "Next", "Commits", "Release", "Release Tag"],
    colAligns: ["left", "center", "left", "left", "right", "center", "left"],
    colWidths: [null, 9],
    style: {
      "padding-left": 1,
      "padding-right": 1,
      head: ["gray"],
      compact: true,
    },
  }) as HorizontalTable;
}

function style(text: CellValue, ...styles: Color[]) {
  for (const style of styles)
    if (style)
      text = style(text.toString());
  return text;
}

function cell(content: string, options: Partial<CellOptions>, ...colors: Color[]): CellOptions {
  for (const color of colors)
    content = color(content);
  options.content = content;
  return options as CellOptions;
}
