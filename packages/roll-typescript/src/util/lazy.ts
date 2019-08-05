import { PluginContext } from "rollup";

/**
 * Gets value from cache by particular key.
 * New value will be calculate by provided calculation function if cache does not provide one.
 * @param cache - plugin context cache.
 * @param key - key for the value in a plugin cache or function calculating it from a fast key.
 * @param calculate - function to use to calculate value when cache does not provide one.
 * @param params - parameters to pass into calculation function.
 */
export function lazy<K, T, P extends any[]>({cache}: PluginContext, key: string,
                                            calculate: (...params: P) => T, ...params: P): T {
  let value = cache.get(key);
  if (value == null) {
    value = calculate(...params);
    cache.set(key, value);
  }
  return value;
}

/**
 * Gets value from cache by particular key.
 * New value will be calculate by provided calculation function if cache does not provide one.
 * @param fast - fast runtime cache.
 * @param fastKey - key for the value in a fast runtime cache.
 * @param cache - plugin context cache.
 * @param key - key for the value in a plugin cache or function calculating it from a fast key.
 * @param calculate - function to use to calculate value when cache does not provide one.
 * @param params - parameters to pass into calculation function.
 */
export function lazy2<K, T, P extends any[]>(fast: Map<any, any>, fastKey: any,
                                             {cache}: PluginContext, key: string | ((fast: K) => string),
                                             calculate: (...params: P) => T, ...params: P): T {
  let value = fast.get(fastKey);
  if (value == null) {
    // calculate persistent key
    if (typeof key === "function")
      key = key(fastKey);
    // find value in a plugin cache
    value = cache.get(key);
    if (value == null) {
      value = calculate(...params);
      cache.set(key, value);
    }
    fast.set(fastKey, value);
  }
  return value;
}
