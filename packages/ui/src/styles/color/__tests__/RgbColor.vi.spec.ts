import {RgbColor} from '../RgbColor';

describe('.toString()', () => {
  test('opaque color omits alpha channel', () => {
    expect(new RgbColor(1, 0, 0).toString()).toBe('#ff0000');
    expect(new RgbColor(0, 1, 0).toString()).toBe('#00ff00');
    expect(new RgbColor(0, 0, 1).toString()).toBe('#0000ff');
    expect(new RgbColor(0, 0, 0).toString()).toBe('#000000');
    expect(new RgbColor(1, 1, 1).toString()).toBe('#ffffff');
  });

  test('transparent color includes alpha channel', () => {
    expect(new RgbColor(1, 0, 0, 0).toString()).toBe('#ff000000');
    expect(new RgbColor(1, 0, 0, 0.5).toString()).toBe('#ff000080');
    expect(new RgbColor(0, 0, 0, 0).toString()).toBe('#00000000');
  });

  test('roundtrip', () => {
    const roundtrip = (r: number, g: number, b: number, a: number) => {
      const color = new RgbColor(r / 255, g / 255, b / 255, a / 255);
      const parsed = RgbColor.fromString(color.toString());
      expect(parsed).toBeDefined();
      const [r2, g2, b2, a2] = parsed!.u8();
      expect(r2).toBe(r);
      expect(g2).toBe(g);
      expect(b2).toBe(b);
      expect(a2).toBe(a);
    };
    roundtrip(0, 0, 0, 255);
    roundtrip(255, 255, 255, 255);
    roundtrip(255, 0, 0, 255);
    roundtrip(128, 64, 32, 255);
    roundtrip(128, 64, 32, 128);
    roundtrip(0, 0, 0, 0);
  });
});

describe('.fromString()', () => {
  test('returns undefined for invalid input', () => {
    expect(RgbColor.fromString('')).toBeUndefined();
    expect(RgbColor.fromString('red')).toBeUndefined();
    expect(RgbColor.fromString('#12')).toBeUndefined();
    expect(RgbColor.fromString('#1234567')).toBeUndefined();
  });

  test('parses #RGB shorthand', () => {
    const c = RgbColor.fromString('#f00')!;
    expect(c).toBeDefined();
    const [r, g, b, a] = c.u8();
    expect(r).toBe(255);
    expect(g).toBe(0);
    expect(b).toBe(0);
    expect(a).toBe(255);
  });

  test('parses #RRGGBB', () => {
    const c = RgbColor.fromString('#ff8040')!;
    expect(c).toBeDefined();
    const [r, g, b, a] = c.u8();
    expect(r).toBe(255);
    expect(g).toBe(128);
    expect(b).toBe(64);
    expect(a).toBe(255);
  });

  test('parses #RRGGBBAA', () => {
    const c = RgbColor.fromString('#ff804080')!;
    expect(c).toBeDefined();
    const [r, g, b, a] = c.u8();
    expect(r).toBe(255);
    expect(g).toBe(128);
    expect(b).toBe(64);
    expect(a).toBe(128);
  });

  test('parses rgb()', () => {
    const c = RgbColor.fromString('rgb(255, 128, 64)')!;
    expect(c).toBeDefined();
    const [r, g, b, a] = c.u8();
    expect(r).toBe(255);
    expect(g).toBe(128);
    expect(b).toBe(64);
    expect(a).toBe(255);
  });

  test('parses rgba()', () => {
    const c = RgbColor.fromString('rgba(255, 128, 64, 0.5)')!;
    expect(c).toBeDefined();
    const [r, g, b, a] = c.u8();
    expect(r).toBe(255);
    expect(g).toBe(128);
    expect(b).toBe(64);
    expect(a).toBe(128);
  });

  test('parses rgba() with 0 alpha', () => {
    const c = RgbColor.fromString('rgba(0, 0, 0, 0)')!;
    expect(c).toBeDefined();
    const [r, g, b, a] = c.u8();
    expect(r).toBe(0);
    expect(g).toBe(0);
    expect(b).toBe(0);
    expect(a).toBe(0);
  });

  test('is case-insensitive for hex', () => {
    const c1 = RgbColor.fromString('#FF0000')!;
    const c2 = RgbColor.fromString('#ff0000')!;
    expect(c1.u8()).toEqual(c2.u8());
  });
});
