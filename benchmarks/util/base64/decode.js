const Benchmark = require('benchmark');
const toBase64 = require('../../../es2020/util/base64').toBase64;
const createFromBase64 = require('../../../es2020/util/base64').createFromBase64;

const fromBase64 = createFromBase64();

const generateBlob = (length) => {
  const uint8 = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    uint8[i] = Math.floor(Math.random() * 256);
  }
  return uint8;
};

const str8 = toBase64(generateBlob(9));
const str16 = toBase64(generateBlob(17));
const str32 = toBase64(generateBlob(33));
const str64 = toBase64(generateBlob(65));
const str128 = toBase64(generateBlob(127));
const str256 = toBase64(generateBlob(257));
const str512 = toBase64(generateBlob(513));
const str1024 = toBase64(generateBlob(1025));

const suite = new Benchmark.Suite;

const encoders = [
  {
    name: `json-joy/util/base64 fromBase64(str)`,
    decode: (str) => fromBase64(str),
  },
  {
    name: `Buffer.from(str, 'base64')`,
    decode: (str) => Buffer.from(str, 'base64'),
  },
];

for (const encoder of encoders) {
  suite.add(encoder.name, () => {
    encoder.decode(str8);
    encoder.decode(str16);
    encoder.decode(str32);
    encoder.decode(str64);
    encoder.decode(str128);
    encoder.decode(str256);
    encoder.decode(str512);
    encoder.decode(str1024);
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
