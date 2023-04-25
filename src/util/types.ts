export type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

export type Brand<S extends string, T, B> = S & {__TYPE__: T; __BRAND__: B};
