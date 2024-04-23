export type ExcludeFromTuple<T extends readonly any[], E> =
  T extends [infer F, ...infer R] ? [F] extends [E] ? ExcludeFromTuple<R, E> :
  [F, ...ExcludeFromTuple<R, E>] : [];
