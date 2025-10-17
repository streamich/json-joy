export const payloads = [
  {
    name: (json: any) => `Small object, ${JSON.stringify(json).length} bytes`,
    data: require('./data/json1'),
  },
  {
    name: (json: any) => `Typical object, ${JSON.stringify(json).length} bytes`,
    data: require('./data/json2'),
  },
  {
    name: (json: any) => `Large object, ${JSON.stringify(json).length} bytes`,
    data: require('./data/json3'),
  },
  {
    name: (json: any) => `Very large object, ${JSON.stringify(json).length} bytes`,
    data: require('./data/json6'),
  },
  {
    name: (json: any) => `Object with many keys, ${JSON.stringify(json).length} bytes`,
    data: require('./data/json-object-many-keys'),
  },
  {
    name: (json: any) => `String ladder, ${JSON.stringify(json).length} bytes`,
    data: require('./data/json-strings-ladder'),
  },
  {
    name: (json: any) => `Long strings, ${JSON.stringify(json).length} bytes`,
    data: require('./data/json-strings-long'),
  },
  {
    name: (json: any) => `Short strings, ${JSON.stringify(json).length} bytes`,
    data: require('./data/json-strings-short'),
  },
  {
    name: (json: any) => `Numbers, ${JSON.stringify(json).length} bytes`,
    data: require('./data/json-numbers'),
  },
  {
    name: (json: any) => `Tokens, ${JSON.stringify(json).length} bytes`,
    data: require('./data/json-tokens'),
  },
];

export const payloadsWithCombined = [
  ...(payloads.length > 1
    ? (() => {
        const combined = payloads.reduce(
          (acc, payload) => [
            // biome-ignore lint: spread is acceptable here
            ...acc,
            payload.data,
          ],
          [] as unknown[],
        );
        return [
          {
            data: combined,
            name: (json: any) => `Combined, ${JSON.stringify(json).length} bytes`,
          },
        ];
      })()
    : []),
  ...payloads,
];
