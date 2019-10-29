import { CLIEngine } from "eslint";

/**
 * Format declarations files via `@typescript-eslint/parser`.
 */
export class DtsPretty {

  readonly cli: CLIEngine;

  constructor() {
    this.cli = new CLIEngine({
      fix: true,
      useEslintrc: false,
      parser: "@typescript-eslint/parser",
      plugins: [
        "@typescript-eslint",
        "eslint-plugin-import",
      ],
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
      },
      rules: {
        "@typescript-eslint/adjacent-overload-signatures": 2,
        "import/newline-after-import": [2, {count: 1}],
        "lines-between-class-members": [2, "always", {exceptAfterSingleLine: true}],
        "lines-around-comment": [2, {
          allowArrayStart: true,
          allowBlockStart: true,
          allowClassStart: true,
          allowObjectStart: true,
          beforeBlockComment: true,
          beforeLineComment: true,
        }],
        "no-multiple-empty-lines": [2, {max: 1}],
      },
    });
  }

  format(text: string, filename?: string) {
    const [result] = this.cli.executeOnText(text, filename).results;
    return result.output || text;
  }
}
