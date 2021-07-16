export function assert(val: boolean, message?: string): asserts val {
  if (!val) {
    throw new Error(message);
  }
}
