import {HslColor} from '../HslColor';
import {RgbColor} from '../RgbColor';

describe('.fromHsl()', () => {
  const assertRoundtrip = (color: HslColor) => {
    const hsl = color.toString() + '';
    const parsed = HslColor.fromString(hsl);
    expect(parsed).toBeDefined();
    expect(parsed!.h).toBeCloseTo(color.h);
    expect(parsed!.s).toBeCloseTo(color.s);
    expect(parsed!.l).toBeCloseTo(color.l);
    expect(parsed!.a).toBeCloseTo(color.a);
  };

  test('roundtrip', () => {
    assertRoundtrip(new HslColor(0, 0, 0));
    assertRoundtrip(new HslColor(360, 100, 100));
    assertRoundtrip(new HslColor(180, 50, 50, 50));
    assertRoundtrip(new HslColor(270, 75, 25, 25));
    assertRoundtrip(new HslColor(1, 2, 3));
  });
});

describe('.fromRgb()', () => {
  const assertRoundtrip = (r: number, g: number, b: number, a: number) => {
    const rgb = new RgbColor(r / 255, g / 255, b / 255, a / 255);
    const hsl = HslColor.fromRgb(rgb).toString() + '';
    const parsed = HslColor.fromString(hsl);
    const rgb2 = parsed!.toRgb();
    const [r2, g2, b2, a2] = rgb2.u8();
    expect(r2).toBe(r);
    expect(g2).toBe(g);
    expect(b2).toBe(b);
    expect(a2).toBe(a);
  };

  test('roundtrip', () => {
    assertRoundtrip(0, 0, 0, 255);
    assertRoundtrip(255, 255, 255, 255);
    assertRoundtrip(128, 128, 128, 128);
    assertRoundtrip(255, 0, 0, 255);
    assertRoundtrip(0, 255, 0, 255);
    assertRoundtrip(0, 0, 255, 255);
    assertRoundtrip(1, 2, 3, 4);
    assertRoundtrip(11, 21, 31, 41);
  });
});

describe('.from()', () => {
  const assertRoundtrip = (r: number, g: number, b: number, a: number) => {
    const rgb = new RgbColor(r / 255, g / 255, b / 255, a / 255);
    const hsl = HslColor.from(rgb)!;
    const hsv = hsl.toHsv();
    const str1 = rgb.hex();
    const str3 = rgb.rgba();
    const str4 = hsl.toString();
    const rgb2 = hsl.toRgb();
    const str5 = rgb2.hex();
    expect(HslColor.from(rgb)!.eq(hsl)).toBe(true);
    expect(HslColor.from(str1)!.eq(hsl)).toBe(true);
    expect(HslColor.from(str3)!.toString()).toBe(hsl.toString());
    expect(HslColor.from(str4)!.toString()).toBe(hsl.toString());
    expect(HslColor.from(str5)!.eq(hsl)).toBe(true);
    expect(HslColor.from(rgb2)!.toString()).toBe(hsl.toString());
    expect(HslColor.from(hsv)!.toString()).toBe(hsl.toString());
  };

  test('roundtrip', () => {
    assertRoundtrip(0, 0, 0, 255);
    assertRoundtrip(255, 255, 255, 255);
    assertRoundtrip(128, 128, 128, 128);
    assertRoundtrip(255, 0, 0, 255);
    assertRoundtrip(0, 255, 0, 255);
    assertRoundtrip(0, 0, 255, 255);
    assertRoundtrip(1, 2, 3, 4);
    assertRoundtrip(11, 21, 31, 41);
  });
});
