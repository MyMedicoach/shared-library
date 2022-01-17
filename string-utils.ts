export function pythonSplit(str: string, sep: string, splitCount?: number) {
  const splits = str.split(sep);

  if (!splitCount) {
    return splits;
  }

  return [
    ...splits.slice(0, splitCount),
    splits.slice(splitCount).join(sep),
  ];
}

export function uriTag(strings: TemplateStringsArray, ...parameters: unknown[]): string {
  let out = '';
  let i = 0;

  for (const string of strings) {
    out += string;
    if (parameters[i]) {
      out += encodeURIComponent(String(parameters[i]));
      i++;
    }
  }

  return out;
}
