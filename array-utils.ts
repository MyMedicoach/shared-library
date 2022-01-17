/**
 * Wraps an item in an array if it is not already one
 *
 * @param val
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

  // eslint-disable-next-line consistent-return
  return toArray(val);
}

export function lastItem<T>(array: T[] | readonly T[] | NodeList): T | undefined {
  if (Array.isArray(array)) {
    return array[array.length - 1];
  }

  // @ts-expect-error https://github.com/microsoft/TypeScript/issues/17002
  return array.item(array.length - 1) as unknown as T;
}

export function *combinedIterator<T>(...iterables: Array<Iterable<T>>): Generator<T, void, undefined> {
  for (const iterable of iterables) {
    yield* iterable;
  }
}

export const EMPTY_ARRAY: readonly any[] = Object.freeze([]);
