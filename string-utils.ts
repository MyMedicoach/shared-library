export function pythonSplit(str: string, sep: string, splitCount?: number) {
  const splits = str.split(sep);

  return splitCount
    ? splits.slice(0, splitCount).concat([splits.slice(splitCount).join(sep)])
    : splits;
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
