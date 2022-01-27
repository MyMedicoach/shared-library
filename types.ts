export type Nullish<T> = T | null | undefined;

export type NonUndefined<T> = T extends undefined ? never : T;

export type NonNull<T> = T extends null ? never : T;

/**
 * Marks some of the keys of the object as optional
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Marks some of the keys of the object as required
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

export type MaybeArray<T> = T[] | T;

export type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends ReadonlyArray<infer ElementType> ? ElementType : never;

export function isNonNullish<T>(value: T | null | undefined): value is T {
  return value != null;
}

export type MaybePromise<T> = Promise<T> | T;

export type RequiredKeys<T> = { [K in keyof T]-?: {} extends Pick<T, K> ? never : K }[keyof T];
export type OptionalKeys<T> = { [K in keyof T]-?: {} extends Pick<T, K> ? K : never }[keyof T];

export type OptionalsAcceptUndefined<T> = {
  [K in keyof T]: K extends OptionalKeys<T> ? T[K] | undefined : T[K]
};
