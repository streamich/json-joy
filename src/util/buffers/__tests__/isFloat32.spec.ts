import {isFloat32} from '../isFloat32';

test('returns true for a float32', () => {
  expect(isFloat32(1.5)).toBe(true);
});

test('returns true for a float64', () => {
  expect(isFloat32(1.1)).toBe(false);
});
