// const clamp = (num: number) => Math.min(1, Math.max(0, num));

export class HsvColor {
  constructor(
    /** Float in range 0 to 1. */
    public h: number,
    /** Float in range 0 to 1. */
    public s: number,
    /** Float in range 0 to 1. */
    public v: number,
    /** Float in range 0 to 1. */
    public a: number = 1,
  ) {}

  // public bump(dh: number = 0, ds: number = 0, dv: number = 0, da: number = 0): HsvColor {
  //   if (dh !== 0) this.h = clamp(this.h + dh);
  //   if (ds !== 0) this.s = clamp(this.s + ds);
  //   if (dv !== 0) this.v = clamp(this.v + dv);
  //   if (da !== 0) this.a = clamp(this.a + da);
  //   return this;
  // }

  // public copy(dh: number = 0, ds: number = 0, dv: number = 0, da: number = 0): HsvColor {
  //   return new HsvColor(
  //     clamp(this.h + dh),
  //     clamp(this.s + ds),
  //     clamp(this.v + dv),
  //     clamp(this.a + da),
  //   );
  // }

  public toString(): string {
    const {h, s, v, a} = this;
    return `hsv(${+(h * 360).toFixed(3)}deg ${+(s * 100).toFixed(3)}% ${+(v * 100).toFixed(3)}% / ${+(a * 100).toFixed(3)}%)`;
  }
}
