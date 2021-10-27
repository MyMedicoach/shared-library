export type Nullish<T> = T | null | undefined;

export type NonUndefined<T> = T extends undefined ? never : T;

export type NonNull<T> = T extends null ? never : T;

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export function isNonNullish<T>(value: T | null | undefined): value is T {
  return value != null;
}
