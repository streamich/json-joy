/**
 * XDR Union data type that contains a discriminant and value.
 * Used for encoding XDR union types where the discriminant determines
 * which arm of the union is active.
 */
export class XdrUnion<T = unknown> {
  constructor(
    public readonly discriminant: number | string | boolean,
    public readonly value: T,
  ) {}
}
