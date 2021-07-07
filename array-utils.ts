/**
 * Wraps an item in an array if it is not already one
 *
 * @param {T[] | undefined | T} val
 * @returns {T[]}
 */
export function toArray<T>(val: undefined | T | T[]): T[] {
  if (val === undefined) {
    return [];
  }

  return Array.isArray(val) ? val : [val];
}

export function lastItem<T>(array: T[] | NodeList): T {
  if (Array.isArray(array)) {
    return array[array.length - 1];
  }

  return array.item(array.length - 1) as unknown as T;
}
