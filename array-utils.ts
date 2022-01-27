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

type Comparator<T> = (a: T, b: T) => number;

export enum SortOrder {
  ASC = 1,
  DESC = -1,
}

/**
 * Returns a comparator that sorts strings alphabetically using `localeCompare` in a case-sensitive way.
 *
 * @param locale The locale of the strings
 * @param order The sort order
 */
export function localizedStringComparator(locale: string, order: SortOrder = SortOrder.ASC): Comparator<string> {
  return (a, b) => a.localeCompare(b, locale) * order;
}

/**
 * Returns a comparator that sorts strings alphabetically using `localeCompare` in a case-insensitive way.
 *
 * @param locale The locale of the strings
 * @param order The sort order
 */
export function localizedStringCiComparator(locale: string, order: SortOrder = SortOrder.ASC): Comparator<string> {
  return (a, b) => a.toLocaleLowerCase(locale).localeCompare(b.toLocaleLowerCase(locale), locale) * order;
}

/**
 * Returns a comparator that sorts numbers.
 *
 * @param order The sort order
 */
export function numberComparator(order: SortOrder = SortOrder.ASC): Comparator<number> {
  return (a, b) => (a - b) * order;
}

/**
 * Returns a comparator that sorts BigInts.
 *
 * @param order The sort order
 */
export function bigIntComparator(order: SortOrder = SortOrder.ASC): Comparator<bigint> {
  return (a, b) => Number((a - b) * BigInt(order));
}

/**
 * Returns a comparator that sorts Date objects.
 *
 * @param order The sort order
 */
export function dateComparator(order: SortOrder = SortOrder.ASC): Comparator<Date> {
  return (a, b) => (a.getTime() - b.getTime()) * order;
}

/**
 * Returns an object comparator the compares a property of the object using another comparator
 *
 * @param key the object property to compare
 * @param comparator the comparator used to compare the property
 */
export function propertyComparator<T extends object, K extends keyof T>(
  key: K,
  comparator: Comparator<T[K]>,
): Comparator<T> {
  return (a: T, b: T) => {
    return comparator(a[key], b[key]);
  };
}

/**
 * Composes multiple comparators together. They are run in-order up to the first one to return a non-zero value.
 *
 * @param comparators the comparators to compose.
 */
export function composedComparator<T>(...comparators: Array<Comparator<T>>): Comparator<T> {
  return (a, b) => {
    for (const comparator of comparators) {
      const out = comparator(a, b);

      if (out !== 0) {
        return out;
      }
    }

    return 0;
  };
}
