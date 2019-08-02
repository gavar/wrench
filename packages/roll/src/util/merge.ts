/**
 * Merge configurations into a single object.
 * Does merge arrays if the final value of the property is an array.
 * @param sources - configurations to merge.
 */
export function merge<T>(...sources: T[]): T {
  const config = Object.assign({}, ...sources);
  for (const key of Object.keys(config))
    arrify(config, key, sources);
  return config;
}

function arrify(config: any, key: keyof any, sources: any[]) {
  if (Array.isArray(config[key]))
    config[key] = sources.map(source => source && source[key])
      .filter(Array.isArray)
      .flat();
}
