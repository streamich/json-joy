/**
 * @category Patch
 */
export class VectorDelayedValue<T extends unknown[]> {
  constructor(public readonly slots: T) {}
}

/**
 * @param slots
 * @returns
 */
export const vec = <T extends unknown[]>(...slots: T): VectorDelayedValue<T> => new VectorDelayedValue(slots);
