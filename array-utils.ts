/**
 * Wraps an item in an array if it is not already one
 *
 * @param {T[] | undefined | T} val
 * @returns {T[]}
 */
export function toArray<T>(val: undefined | null | T | T[]): T[] {
  if (val == null) {
    return [];
  }

  return Array.isArray(val) ? val : [val];
}

export function toArrayOrUndefined<T>(val: undefined | null | T | T[]): T[] | undefined {
  if (val === undefined) {
    return undefined;
  }

  return toArray(val);
}

export function lastItem<T>(array: T[] | NodeList): T {
  if (Array.isArray(array)) {
    return array[array.length - 1];
  }

  return array.item(array.length - 1) as unknown as T;
}
