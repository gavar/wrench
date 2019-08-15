import { findKey } from "@emulsy/async";

/** Asynchronous predicate with associated messages. */
export type AsyncTest<T> = [(value: T) => boolean | Promise<boolean>, string];

/**
 * Get message of the test that satisfy criteria defined by the predicate.
 * Performs asynchronously, but returns first result.
 * @param value - value to check.
 * @param tests - tests to run.
 * @return message associated with the predicate on match; false otherwise.
 */
export async function testify<T>(value: T, tests: AsyncTest<T>[]): Promise<true | string> {
  const key = await findKey(tests, ([predicate]) => predicate(value));
  return key != null ? tests[key][1] || String(key) : true;
}
