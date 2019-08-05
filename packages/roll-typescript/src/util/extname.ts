/**
 * Gets the file extension starting with a first dot after last directory separator.
 * As oppose to {@link path.extname}, supports multiple dots as file extension.
 * @example
 * `dir/file.js` -> `.js`
 * `dir/file.js.map` -> `.js.map`
 * @param p - path to evaluate
 */
export function extname(p: string) {
  const fwd = p.lastIndexOf("/") + 1;
  const bck = p.lastIndexOf("\\") + 1;
  const dot = p.indexOf(".", fwd > bck ? fwd : bck);
  return dot < 0 ? "" : dot > 0 ? p.slice(dot) : p;
}
