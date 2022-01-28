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
