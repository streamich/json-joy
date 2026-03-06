import {HslColor} from '../HslColor';

describe('.fromHsl()', () => {
  const assertRoundtrip = (color: HslColor) => {
    const hsl = color.toHsl() + '';
    const parsed = HslColor.fromHsl(hsl);
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
