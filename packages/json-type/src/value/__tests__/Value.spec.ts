import {unknown, Value} from '../Value';

test('typeless value', () => {
  const val = unknown('test');
  expect(val instanceof Value).toBe(true);
  expect(val.data).toBe('test');
  expect(val.type).toBe(undefined);
});
