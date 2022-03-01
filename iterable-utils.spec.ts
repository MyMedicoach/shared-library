import { splitBy } from './iterable-utils';

describe('splitBy', () => {
  it('returns an empty array for empty iterable', () => {
    const out = splitBy([], (val, nextVal) => {
      return typeof val === typeof nextVal;
    });

    expect(out).toEqual([]);
  });

  it('splits iterables in groups', () => {
    const out = splitBy(['a', 1, 'b', 'c', 2, 3, 'd'], (val, nextVal) => {
      return typeof val === typeof nextVal;
    });

    expect(out).toEqual([
      ['a'],
      [1],
      ['b', 'c'],
      [2, 3],
      ['d'],
    ]);
  });
});
