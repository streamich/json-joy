export class Color {
  constructor(
    public readonly H: number,
    public readonly S: number,
    public readonly L: number,
    public readonly A: number = 100,
    public readonly light: boolean = true,
  ) {}

  public setA(A: number): Color {
    const {H, S, L, light} = this;
    return new Color(H, S, L, A, light);
  }

  public setH(H: number): Color {
    const {S, L, A, light} = this;
    return new Color(H, S, L, A, light);
  }

  public setS(S: number): Color {
    const {H, L, A, light} = this;
    return new Color(H, S, L, A, light);
  }

  public setL(L: number): Color {
    const {H, S, A, light} = this;
    return new Color(H, S, L, A, light);
  }

  public dS(dS: number): Color {
    const {H, S, L, A, light} = this;
    return new Color(H, S + dS, L, A, light);
  }

  public dL(dL: number): Color {
    const {H, S, L, A} = this;
    return new Color(H, S, L + (this.light ? dL : -dL), A);
  }

  public toString(): string {
    const {H, S, L, A} = this;
    return `oklch(${L}% ${S} ${H} / ${A}%)`;
  }
}
