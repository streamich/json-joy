export interface JsonDocument {
  name: string;
  json: unknown;
  only?: true;
}

export const binaryDocuments: JsonDocument[] = [
  {
    name: 'buffer',
    json: new Uint8Array([1, 2, 3]),
  },
  {
    name: 'empty buffer',
    json: new Uint8Array([]),
  },
  {
    name: 'buffer in array',
    json: [new Uint8Array([1, 2, 3])],
  },
  {
    name: 'empty buffer in array',
    json: [new Uint8Array([])],
  },
  {
    name: 'buffer in object',
    json: {
      foo: new Uint8Array([]),
    },
  },
  {
    name: 'empty buffer in object',
    json: {
      foo: new Uint8Array([]),
    },
  },
  {
    name: 'multiple buffers in object',
    json: {
      foo: new Uint8Array([]),
      bar: new Uint8Array([1]),
      baz: new Uint8Array([221, 1]),
    },
  },
  {
    name: 'buffers in complex object',
    json: {
      a: 123,
      foo: new Uint8Array([]),
      arr: [
        true,
        null,
        new Uint8Array([5, 3, 4, 2, 2, 34, 2, 1]),
        {
          gg: new Uint8Array([1, 2, 55]),
        },
      ],
      bar: new Uint8Array([1]),
      gg: 123,
      s: 'adsf',
      baz: new Uint8Array([221, 1]),
    },
  },
];
