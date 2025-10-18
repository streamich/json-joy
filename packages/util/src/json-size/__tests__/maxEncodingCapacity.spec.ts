import {maxEncodingCapacity} from '../maxEncodingCapacity';

test('computes size of single values', () => {
  expect(maxEncodingCapacity(null)).toBe(4);
  expect(maxEncodingCapacity(true)).toBe(5);
  expect(maxEncodingCapacity(false)).toBe(5);
  expect(maxEncodingCapacity(1)).toBe(22);
  expect(maxEncodingCapacity(1.1)).toBe(22);
  expect(maxEncodingCapacity('123')).toBe(20);
  expect(maxEncodingCapacity('')).toBe(5);
  expect(maxEncodingCapacity('A')).toBe(10);
  expect(maxEncodingCapacity([])).toBe(5);
  expect(maxEncodingCapacity({})).toBe(5);
  expect(maxEncodingCapacity({foo: 1})).toBe(49);
  expect(maxEncodingCapacity({foo: [1]})).toBe(55);
});

test('a larger value', () => {
  expect(
    maxEncodingCapacity({
      name: 'cooking receipt',
      json: {
        id: '0001',
        type: 'donut',
        name: 'Cake',
        ppu: 0.55,
        batters: {
          batter: [
            {id: '1001', type: 'Regular'},
            {id: '1002', type: 'Chocolate'},
            {id: '1003', type: 'Blueberry'},
            {id: '1004', type: "Devil's Food"},
          ],
        },
        topping: [
          {id: '5001', type: 'None'},
          {id: '5002', type: 'Glazed'},
          {id: '5005', type: 'Sugar'},
          {id: '5007', type: 'Powdered Sugar'},
          {id: '5006', type: 'Chocolate with Sprinkles'},
          {id: '5003', type: 'Chocolate'},
          {id: '5004', type: 'Maple'},
        ],
      },
    }),
  ).toBe(1875);
});
