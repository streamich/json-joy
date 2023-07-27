/**
 * @category Patch
 */
export class Konst<T = unknown> {
  constructor(public readonly val: T) {}
}

export const konst = <T>(val: T): Konst<T> => new Konst<T>(val);
