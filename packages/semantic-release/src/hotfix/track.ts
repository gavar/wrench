const fixed: Record<string, boolean> = {};

export function trackHotfix(path: string) {
  if (!fixed[path]) {
    console.log("hotfix:", path);
    return fixed[path] = true;
  }
}
