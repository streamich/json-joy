const rbgRound = (value: number) => Math.min(Math.floor(value * 256), 255);
const hex2 = (n: number) => n.toString(16).padStart(2, '0');

const HEX_REGEX = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const RGB_REGEX = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?\)$/i;

export class RgbColor {
  public static fromString(str: string): RgbColor | undefined {
    const hex = HEX_REGEX.exec(str);
    if (hex) {
      const h = hex[1];
      if (h.length === 3) {
        return new RgbColor(
          parseInt(h[0] + h[0], 16) / 255,
          parseInt(h[1] + h[1], 16) / 255,
          parseInt(h[2] + h[2], 16) / 255,
        );
      }
      return new RgbColor(
        parseInt(h.slice(0, 2), 16) / 255,
        parseInt(h.slice(2, 4), 16) / 255,
        parseInt(h.slice(4, 6), 16) / 255,
        h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1,
      );
    }
    const rgb = RGB_REGEX.exec(str);
    if (rgb) {
      return new RgbColor(
        parseInt(rgb[1]) / 255,
        parseInt(rgb[2]) / 255,
        parseInt(rgb[3]) / 255,
        rgb[4] !== undefined ? parseFloat(rgb[4]) : 1,
      );
    }
    return;
  }

  constructor(
    /** Float in range 0 to 1. */
    public readonly r: number,
    /** Float in range 0 to 1. */
    public readonly g: number,
    /** Float in range 0 to 1. */
    public readonly b: number,
    /** Float in range 0 to 1. */
    public readonly a: number = 1,
  ) {}

  public u8(): [r: number, g: number, b: number, a: number] {
    return [rbgRound(this.r), rbgRound(this.g), rbgRound(this.b), rbgRound(this.a)];
  }

  public hex(): string {
    const [r, g, b, a] = this.u8();
    const base = '#' + hex2(r) + hex2(g) + hex2(b);
    return a === 255 ? base : base + hex2(a);
  }

  public rgb(): string {
    const [r, g, b] = this.u8();
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }

  public rgba(): string {
    const [r, g, b] = this.u8();
    return 'rgba(' + r + ',' + g + ',' + b + ',' + +this.a.toFixed(5) + ')';
  }

  public toString(): string {
    return this.hex();
  }
}
