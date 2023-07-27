/**
 * @category Patch
 */
export class Tuple<T extends unknown[]> {
  constructor(public readonly slots: T) {}
}

export const tup = <T extends unknown[]>(...slots: T): Tuple<T> => new Tuple(slots);
