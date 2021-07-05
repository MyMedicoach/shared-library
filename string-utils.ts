export function pythonSplit(str: string, sep: string, splitCount?: number) {
  const splits = str.split(sep);

  return splitCount
    ? splits.slice(0, splitCount).concat([splits.slice(splitCount).join(sep)])
    : splits;
}
