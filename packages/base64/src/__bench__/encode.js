const Benchmark = require('benchmark');
const {toBase64, createToBase64} = require('../../lib');
const {fromByteArray} = require('base64-js');
const {encode: encodeJsBase64} = require('js-base64');

const toBase64Native = createToBase64();

const generateBlob = (length) => {
  const uint8 = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    uint8[i] = Math.floor(Math.random() * 256);
  }
  return uint8;
};

const arr8 = generateBlob(9);
const arr16 = generateBlob(17);
const arr32 = generateBlob(33);
const arr64 = generateBlob(65);
const arr128 = generateBlob(127);
const _arr256 = generateBlob(257);
const _arr512 = generateBlob(513);
const _arr1024 = generateBlob(1025);

// fast-base64-encode
const table = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split('');
const fastBase64Encode = (source) => {
  let out = '';
  let tmp;
  const length = source.byteLength;
  const extraLength = length % 3;
  const baseLength = length - extraLength;
  for (let i = 0; i < baseLength; i += 3) {
    tmp = ((source[i] & 0xff) << 16) | ((source[i + 1] & 0xff) << 8) | (source[i + 2] & 0xff);
    out += table[(tmp >> 18) & 0x3f] + table[(tmp >> 12) & 0x3f] + table[(tmp >> 6) & 0x3f] + table[tmp & 0x3f];
  }
  if (extraLength) {
    if (extraLength === 1) {
      tmp = source[baseLength] & 0xff;
      out += table[tmp >> 2] + table[(tmp << 4) & 0x3f] + '==';
    } else {
      tmp = ((source[baseLength] & 0xff) << 8) | (source[baseLength + 1] & 0xff);
      out += table[tmp >> 10] + table[(tmp >> 4) & 0x3f] + table[(tmp << 2) & 0x3f] + '=';
    }
  }
  return out;
};

const suite = new Benchmark.Suite();

const encoders = [
  {
    name: `@jsonjoy.com/base64 toBase64(uint8)`,
    encode: (uint8) => toBase64(uint8),
  },
  {
    name: `@jsonjoy.com/base64 createToBase64()(uint8)`,
    encode: (uint8) => toBase64Native(uint8, uint8.length),
  },
  {
    name: `js-base64`,
    encode: (uint8) => encodeJsBase64(uint8),
  },
  {
    name: `fast-base64-encode`,
    encode: (uint8) => fastBase64Encode(uint8),
  },
  {
    name: `base64-js`,
    encode: (uint8) => fromByteArray(uint8),
  },
  {
    name: `Buffer.from(uint8).toString('base64');`,
    encode: (uint8) => Buffer.from(uint8).toString('base64'),
  },
];

for (const encoder of encoders) {
  suite.add(encoder.name, () => {
    encoder.encode(arr8);
    encoder.encode(arr16);
    encoder.encode(arr32);
    encoder.encode(arr64);
    encoder.encode(arr128);
    // encoder.encode(arr256);
    // encoder.encode(arr512);
    // encoder.encode(arr1024);
  });
}

suite
  .on('cycle', (event) => {
    console.log(String(event.target) + `, ${Math.round(1000000000 / event.target.hz)} ns/op`);
  })
  .on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run();
