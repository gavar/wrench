/**
 * Coerce pattern argument.
 * @param pattern - pattern input value
 */
export function coercePattern(pattern: string) {
  return pattern === "*" ? "**" : pattern;
}
