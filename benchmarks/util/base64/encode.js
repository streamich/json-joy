const Benchmark = require('benchmark');
const encode = require('../../../es2020/util/base64').encode;

const generateBlob = (length) => {
  const uint8 = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    uint8[i] = Math.floor(Math.random() * 256);
  }
  return uint8;
};

const uint8Short = generateBlob(10);
const uint8Long = generateBlob(1000);

// fast-base64-encode
const table = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split('');
const fastBase64Encode = (source) => {
  let out = ''
  let tmp;
  const length = source.byteLength;
  const extraLength = length % 3;
  const baseLength = length - extraLength;
  for (let i = 0; i < baseLength; i += 3) {
    tmp = (source[i] & 0xFF) << 16 | (source[i + 1] & 0xFF) << 8 | (source[i + 2] & 0xFF);
    out += (table[tmp >> 18 & 0x3F] + table[tmp >> 12 & 0x3F] + table[tmp >> 6 & 0x3F] + table[tmp & 0x3F]);
  }
  if (extraLength) {
    if (extraLength === 1) {
      tmp = (source[baseLength] & 0xFF);
      out += table[tmp >> 2] + table[tmp << 4 & 0x3F] + '==';
    } else {
      tmp = (source[baseLength] & 0xFF) << 8 | (source[baseLength + 1] & 0xFF);
      out += table[tmp >> 10] + table[tmp >> 4 & 0x3F] + table[tmp << 2 & 0x3F] + '=';
    }
  }
  return out;
};

const suite = new Benchmark.Suite;

const encoders = [
  {
    name: `json-joy/util/base64 encode(uint8)`,
    encode: (uint8) => encode(uint8),
  },
  {
    name: `fast-base64-encode`,
    encode: (uint8) => fastBase64Encode(uint8),
  },
  {
    name: `Buffer.from(uint8).toString('base64');`,
    encode: (uint8) => Buffer.from(uint8).toString('base64'),
  },
];

for (const encoder of encoders) {
  suite.add(encoder.name, () => {
    encoder.encode(uint8Short);
    encoder.encode(uint8Long);
  });
}

suite
  .on('cycle', function(event) {
    console.log(String(event.target) + `, ${Math.round(1000000000 / event.target.hz)} ns/op`);
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run();
