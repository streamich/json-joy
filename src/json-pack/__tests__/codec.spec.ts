import {decode} from '../decode';
import {JsonPackExtension} from '../JsonPackExtension';
import {Encoder} from '..';

const encoder = new Encoder(1024, 0xFFFFFF);
const encode = (x: unknown) => encoder.encode(x);

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
  {
    name: 'small negative integer',
    json: -15,
  },
  {
    name: 'small negative integer - 2',
    json: -1,
  },
  {
    name: 'small negative integer - 3',
    json: -2,
  },
  {
    name: 'small negative char',
    json: -100,
  },
  {
    name: 'small negative char - 2',
    json: -55,
  },
  {
    name: 'small negative char at boundary',
    json: -127,
  },
  {
    name: 'small negative char at boundary - 2',
    json: -128,
  },
  {
    name: 'negative two byte word',
    json: -0x0FCD,
  },
  {
    name: 'negative four byte word',
    json: -0x0FCDAA,
  },
  {
    name: 'negative six byte word',
    json: -0xAABBCCDDEE,
  },
  {
    name: 'float32',
    json: 1.5,
  },
  {
    name: 'float64',
    json: 1.1,
  },
  {
    name: 'empty string',
    json: '',
  },
  {
    name: 'supports umlauts',
    json: 'äbc',
  },
  {
    name: 'supports emojis',
    json: '👨‍👩‍👦‍👦',
  },
  {
    name: 'empty string in array',
    json: [''],
  },
  {
    name: 'empty string in object',
    json: {foo: ''},
  },
  {
    name: 'simple string',
    json: 'hello world',
  },
  {
    name: 'empty array',
    json: [],
  },
  {
    name: 'empty object',
    json: {},
  },
  {
    name: 'simple object',
    json: {
      foo: 'bar',
      baz: ['qux'],
    },
  },
  {
    name: 'blog post',
    json: {
      id: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
      author: {
        name: 'John',
        handle: '@johny',
      },
      lastSeen: -12345,
      tags: [null, 'Sports', 'Personal', 'Travel'],
      pins: [{
        id: 1239494
      }],
      marks: [
        {
          x: 1,
          y: 1.234545,
          w: 0.23494,
          h: 0,
        }
      ],
      hasRetweets: false,
      approved: true,
      likes: 33,
    },
  },
  /*
  {
    name: 'simple ArrayBuffer',
    json: new Uint8Array([1, 2, 3]).buffer,
  },
  {
    name: 'empty ArrayBuffer',
    json: new Uint8Array([]).buffer,
  },
  {
    name: '255 byte ArrayBuffer',
    json: new Uint8Array(255).buffer,
  },
  {
    name: '256 byte ArrayBuffer',
    json: new Uint8Array(256).buffer,
  },
  {
    name: '0xFFFF byte ArrayBuffer',
    json: new Uint8Array(0xFFFF).buffer,
  },
  {
    name: '0xFFFF + 1 byte ArrayBuffer',
    json: new Uint8Array(0xFFFF + 1).buffer,
  },
  {
    name: '1 byte extension',
    json: new JsonPackExtension(1, new Uint8Array([1]).buffer),
  },
  {
    name: '2 byte extension',
    json: new JsonPackExtension(1, new Uint8Array([1, 1]).buffer),
  },
  {
    name: '4 byte extension',
    json: new JsonPackExtension(6, new Uint8Array([1, 1, 2, 5]).buffer),
  },
  {
    name: '8 byte extension',
    json: new JsonPackExtension(213, new Uint8Array([1, 1, 2, 5, 0, 0, 3, 3]).buffer),
  },
  {
    name: '16 byte extension',
    json: new JsonPackExtension(0, new Uint8Array([1, 1, 2, 5, 0, 0, 3, 3, 1, 1, 1, 1, 2, 2, 2, 2]).buffer),
  },
  {
    name: '10 byte extension',
    json: new JsonPackExtension(10, new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 0]).buffer),
  },
  {
    name: '255 byte extension',
    json: new JsonPackExtension(10, new Uint8Array(255).buffer),
  },
  {
    name: '256 byte extension',
    json: new JsonPackExtension(11, new Uint8Array(256).buffer),
  },
  {
    name: '0xFFFF byte extension',
    json: new JsonPackExtension(12, new Uint8Array(0xFFFF).buffer),
  },
  {
    name: '0xFFFF + 1 byte extension',
    json: new JsonPackExtension(12, new Uint8Array(0xFFFF + 1).buffer),
  },
  {
    name: '0xFFFFF byte extension',
    json: new JsonPackExtension(12, new Uint8Array(0xFFFFF).buffer),
  },
  */
];

for (const t of tests) { 
  test(t.name, () => {
    const buf = encode(t.json);
    const res = decode(buf, 0);
    expect(res[0]).toEqual(t.json);
  });
}
