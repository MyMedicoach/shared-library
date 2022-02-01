export function isObject(val: any): val is object {
  return val !== null && typeof val === 'object';
}

export const EMPTY_OBJECT = Object.freeze({});

export function isPojo(obj: any): obj is { [key: string]: string } {
  if (obj === null || typeof obj !== 'object') {
    return false;
  }

  const prototype = Object.getPrototypeOf(obj);

  return prototype == null || prototype === Object.prototype;
}
