export function *range(start: number, end: number, step: number = 1) {
  let i = start;
  while (i <= end) {
    yield i;

    i += step;
  }
}

export function padNumber(number: number | string, length: number): string {
  return String(number).padStart(length, '0');
}

export function clamp(min: number, value: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
