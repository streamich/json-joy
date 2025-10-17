const Benchmark = require('benchmark');
const toBase64 = require('../../lib').toBase64;
const {bufferToUint8Array} = require('../../lib/util/buffers/bufferToUint8Array');
const {fromBase64, createFromBase64} = require('../../lib');
const {toByteArray} = require('base64-js');
const {decode: decodeJsBase64} = require('js-base64');

const fromBase642 = createFromBase64();

const generateBlob = (length) => {
  const uint8 = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    uint8[i] = Math.floor(Math.random() * 256);
  }
  return uint8;
};

const str4 = toBase64(generateBlob(4));
const str8 = toBase64(generateBlob(8));
const str16 = toBase64(generateBlob(16));
const str24 = toBase64(generateBlob(24));
const str32 = toBase64(generateBlob(32));
const str64 = toBase64(generateBlob(64));
const str128 = toBase64(generateBlob(128));
const str256 = toBase64(generateBlob(256));

const suite = new Benchmark.Suite();

const encoders = [
  {
    name: `@jsonjoy.com/base64 fromBase64(str)`,
    decode: (str) => fromBase64(str),
  },
  {
    name: `@jsonjoy.com/base64 createFromBase64()(str)`,
    decode: (str) => fromBase642(str),
  },
  {
    name: `Buffer.from(str, 'base64')`,
    decode: (str) => bufferToUint8Array(Buffer.from(str, 'base64')),
  },
  {
    name: `base64-js`,
    decode: (str) => toByteArray(str),
  },
  {
    name: `js-base64`,
    decode: (str) => decodeJsBase64(str),
  },
];

for (const encoder of encoders) {
  // Warm up
  for (let i = 0; i < 100000; i++) {
    encoder.decode(str8);
    encoder.decode(str256);
  }
  suite.add(encoder.name, () => {
    encoder.decode(str4);
    encoder.decode(str8);
    encoder.decode(str16);
    encoder.decode(str24);
    encoder.decode(str32);
    encoder.decode(str64);
    encoder.decode(str128);
    encoder.decode(str256);
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
