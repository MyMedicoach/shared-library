export function assert(val: boolean, message?: string): asserts val is true {
  if (!val) {
    throw new Error(message);
  }
}
