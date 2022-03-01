export function assert(val: boolean, message?: string): asserts val {
  if (!val) {
    throw new Error(message);
  }
}

export function isArrayOf<T>(callback: ((val: any) => val is T), value: any): value is T[] {
  if (!Array.isArray(value)) {
    return false;
  }

  for (const item of value) {
    if (!callback(item)) {
      return false;
    }
  }

  return true;
}
