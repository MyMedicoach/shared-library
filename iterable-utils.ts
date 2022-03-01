/**
 * @returns the highest entry of an iterable according to a comparator.
 */
export function max<T>(iterable: Iterable<T>, comparator: ((a: T, b: T) => number)): T | undefined {
  const iterator = iterable[Symbol.iterator]();
  const first = iterator.next();
  if (first.done) {
    return undefined;
  }

  let maxVal: T = first.value;

  for (const item of iterable) {
    if (comparator(maxVal, item) > 0) {
      maxVal = item;
    }
  }

  // eslint-disable-next-line consistent-return
  return maxVal;
}

/**
 * @returns the lowest entry of an iterable according to a comparator.
 */
export function min<T>(iterable: Iterable<T>, comparator: ((a: T, b: T) => number)): T | undefined {
  const iterator = iterable[Symbol.iterator]();
  const first = iterator.next();
  if (first.done) {
    return undefined;
  }

  let minVal: T = first.value;

  for (const item of iterable) {
    if (comparator(minVal, item) < 0) {
      minVal = item;
    }
  }

  // eslint-disable-next-line consistent-return
  return minVal;
}

/**
 * Groups the contents of an iterable.
 *
 * The callback function will be called with two values. If true is returned, the two values will be kept in the same group.
 * If false is returned, they will be in different groups.
 *
 * Item order is preserved.
 *
 * @param iterable The iterable whose contents will be grouped.
 * @param callback The callback determining if two values should be in the same group.
 */
export function splitBy<T>(iterable: Iterable<T>, callback: (previousValue: T, nextValue: T) => boolean): T[][] {
  const iterator = iterable[Symbol.iterator]();
  const first = iterator.next();

  if (first.done) {
    return [];
  }

  const groups: T[][] = [];

  let currentGroup: T[] = [first.value];
  let previousValue: T = first.value;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const entry = iterator.next();
    if (entry.done) {
      if (currentGroup.length > 0) {
        groups.push(currentGroup);
      }

      break;
    }

    if (!callback(previousValue, entry.value)) {
      groups.push(currentGroup);
      currentGroup = [];
    }

    currentGroup.push(entry.value);
    previousValue = entry.value;
  }

  return groups;
}

/**
 * A specialized `groupBy` function that groups the contents of an iterable based on a boolean condition.
 *
 * @param iterable
 * @param cb
 */
export function groupByCondition<T>(iterable: Iterable<T>, cb: (t: T) => boolean): [truthy: T[], falsy: T[]] {
  const passes: T[] = [];
  const fails: T[] = [];

  for (const item of iterable) {
    if (cb(item)) {
      passes.push(item);
    } else {
      fails.push(item);
    }
  }

  return [passes, fails];
}
