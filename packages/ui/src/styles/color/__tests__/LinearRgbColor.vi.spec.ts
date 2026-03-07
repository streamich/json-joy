import {RgbColor} from '../RgbColor';
import {LinearRgbColor} from '../LinearRgbColor';

describe('luminance (Y)', () => {
  test('white should have luminance of 1.0', () => {
    const white = RgbColor.fromString('#ffffff')!;
    const linear = LinearRgbColor.fromRgb(white);
    expect(linear.Y()).toBeCloseTo(1.0, 5);
  });

  test('black should have luminance of 0.0', () => {
    const black = RgbColor.fromString('#000000')!;
    const linear = LinearRgbColor.fromRgb(black);
    expect(linear.Y()).toBe(0);
  });

  test('mid-gray luminance should match WCAG expectation', () => {
    // #808080 = 128/255 = 0.50196...
    const gray = RgbColor.fromString('#808080')!;
    const linear = LinearRgbColor.fromRgb(gray);
    // Expected: ((0.50196 + 0.055)/1.055)^2.4 = ~0.214
    expect(linear.Y()).toBeCloseTo(0.2158);
  });
});

describe('contrast-ratio', () => {
  test('white and black should be 21:1', () => {
    const white = LinearRgbColor.fromRgb(RgbColor.fromString('#fff')!);
    const black = LinearRgbColor.fromRgb(RgbColor.fromString('#000')!);
    expect(white.contrast(black)).toBeCloseTo(21, 1);
  });

  test('identical colors should be 1:1', () => {
    const color = LinearRgbColor.fromRgb(RgbColor.fromString('#ff0000')!);
    expect(color.contrast(color)).toBe(1);
    const color2 = LinearRgbColor.fromRgb(RgbColor.fromString('#123456')!);
    expect(color2.contrast(color2)).toBe(1);
  });

  test('should match WCAG example: blue on white', () => {
    const blue = LinearRgbColor.fromRgb(RgbColor.fromString('#0000ff')!);
    const white = LinearRgbColor.fromRgb(RgbColor.fromString('#ffffff')!);
    // Pure blue luminance is 0.0722
    // (1.0 + 0.05) / (0.0722 + 0.05) = 8.59
    expect(white.contrast(blue)).toBeCloseTo(8.59);
  });
});
