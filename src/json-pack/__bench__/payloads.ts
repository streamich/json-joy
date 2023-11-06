export const payloads = [
  {
    name: (json: any) => `Small object, ${JSON.stringify(json).length} bytes`,
    data: require('../../__bench__/data/json1'),
  },
  {
    name: (json: any) => `Typical object, ${JSON.stringify(json).length} bytes`,
    data: require('../../__bench__/data/json2'),
  },
  {
    name: (json: any) => `Large object, ${JSON.stringify(json).length} bytes`,
    data: require('../../__bench__/data/json3'),
  },
  {
    name: (json: any) => `Very large object, ${JSON.stringify(json).length} bytes`,
    data: require('../../__bench__/data/json6'),
  },
  {
    name: (json: any) => `Object with many keys, ${JSON.stringify(json).length} bytes`,
    data: require('../../__bench__/data/json-object-many-keys'),
  },
  {
    name: (json: any) => `String ladder, ${JSON.stringify(json).length} bytes`,
    data: require('../../__bench__/data/json-strings-ladder'),
  },
  {
    name: (json: any) => `Long strings, ${JSON.stringify(json).length} bytes`,
    data: require('../../__bench__/data/json-strings-long'),
  },
  {
    name: (json: any) => `Short strings, ${JSON.stringify(json).length} bytes`,
    data: require('../../__bench__/data/json-strings-short'),
  },
  {
    name: (json: any) => `Numbers, ${JSON.stringify(json).length} bytes`,
    data: require('../../__bench__/data/json-numbers'),
  },
  {
    name: (json: any) => `Tokens, ${JSON.stringify(json).length} bytes`,
    data: require('../../__bench__/data/json-tokens'),
  },
];

if (payloads.length > 1) {
  const combined = payloads.reduce((acc, payload) => [...acc, payload.data], [] as unknown[]);
  payloads.splice(0, 0, {
    data: combined,
    name: (json: any) => `Combined, ${JSON.stringify(json).length} bytes`,
  });
}
