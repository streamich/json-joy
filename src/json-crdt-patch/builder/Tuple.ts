/**
 * @category Patch
 */
export class VectorDelayedValue<T extends unknown[]> {
  constructor(public readonly slots: T) {}
}

/**
 * @param slots
 * @returns
 * @deprecated Use `s.vec(...)` instead.
 */
export const vec = <T extends unknown[]>(...slots: T): VectorDelayedValue<T> => new VectorDelayedValue(slots);
