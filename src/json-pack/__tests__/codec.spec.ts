import {encode} from '../encode';
import {decode} from '../decode';

const tests: Array<{name: string, json: unknown}> = [
  {
    name: 'simple document',
    json: {
      name: 'Senior Pomidor',
      age: 12,
      keywords: ['tomato man'],
    },
  },
  {
    name: 'small int',
    json: 123,
  },
  {
    name: 'byte',
    json: 222,
  },
  {
    name: 'two byte int',
    json: 1024,
  },
  {
    name: 'four byte word',
    json: 0xFAFAFAFA,
  },
  {
    name: 'eight byte word',
    json: 0x74747474239,
  },
];

for (const t of tests) { 
  test(t.name, () => {
    const buf = encode(t.json);
    const res = decode(buf, 0);
    expect(res[0]).toEqual(t.json);
  });
}
