import {b} from '@jsonjoy.com/util/lib/buffers/b';
import {toHex, fromHex} from '../bin';

describe('toHex()', () => {
  test('can convert buffer to string', () => {
    const buffer = b(1, 2, 3, 4, 5);
    const hex = toHex(buffer);
    expect(hex).toBe('AbAcAdAeAf');
  });

  test('can convert buffer to string', () => {
    const buffer = b(0, 127, 255);
    const hex = toHex(buffer);
    expect(hex).toBe('AaHpPp');
  });
});

describe('fromHex()', () => {
  test('can convert buffer to string', () => {
    const buffer = fromHex('AbAcAdAeAf');
    expect(buffer).toEqual(b(1, 2, 3, 4, 5));
  });

  test('can convert buffer to string', () => {
    const buffer = fromHex('AaHpPp');
    expect(buffer).toEqual(b(0, 127, 255));
  });
});
