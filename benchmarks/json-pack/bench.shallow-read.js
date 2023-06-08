const {runBenchmark} = require('../bench/runBenchmark');

const benchmark = {
  name: 'Encoding',
  warmup: 10000,
  payloads: [
    {
      name: json => `Typical object, ${JSON.stringify(json).length} bytes`,
      data: require('../data/json2'),
      test: () => 'Sports 🏀',
    },
  ],
  runners: [
    {
      name: 'JSON.parse()',
      setup: (json) => {
        const doc = JSON.stringify(json);
        return () => {
          const parsed = JSON.parse(doc);
          return parsed[5]?.value?.json?.tags[1];
        };
      },
    },
    {
      name: 'msgpackr',
      setup: (json) => {
        const {decode} = require('msgpackr');
        const {MsgPackEncoderFast} = require('../../es2020/json-pack/msgpack/MsgPackEncoderFast');
        const encoder = new MsgPackEncoderFast();
        const doc = encoder.encode(json);
        return () => {
          const parsed = decode(doc);
          return parsed[5]?.value?.json?.tags[1];
        };
      },
    },
    {
      name: 'cbor-x',
      setup: (json) => {
        const {CborEncoder} = require('../../es2020/json-pack/cbor/CborEncoder');
        const {decode} = require('cbor-x');
        const encoder = new CborEncoder();
        const doc = encoder.encode(json);
        return () => {
          const parsed = decode(doc);
          return parsed[5]?.value?.json?.tags[1];
        };
      },
    },
    {
      name: 'MsgPackDecoder',
      setup: (json) => {
        const {MsgPackEncoderFast} = require('../../es2020/json-pack/msgpack/MsgPackEncoderFast');
        const {MsgPackDecoder} = require('../../es2020/json-pack/msgpack/MsgPackDecoder');
        const encoder = new MsgPackEncoderFast();
        const doc = encoder.encode(json);
        const decoder = new MsgPackDecoder();
        return () => {
          const parsed = decoder.decode(doc);
          return parsed[5]?.value?.json?.tags[1];
        };
      },
    },
    {
      name: 'CborDecoder',
      setup: (json) => {
        const {CborEncoder} = require('../../es2020/json-pack/cbor/CborEncoder');
        const {CborDecoder} = require('../../es2020/json-pack/cbor/CborDecoder');
        const encoder = new CborEncoder();
        const doc = encoder.encode(json);
        const decoder = new CborDecoder();
        return () => {
          const parsed = decoder.decode(doc);
          return parsed[5]?.value?.json?.tags[1];
        };
      },
    },
    {
      name: 'MsgPackDecoder.{findKey,findIndex}()',
      setup: (json) => {
        const {MsgPackEncoderFast} = require('../../es2020/json-pack/msgpack/MsgPackEncoderFast');
        const {MsgPackDecoder} = require('../../es2020/json-pack/msgpack/MsgPackDecoder');
        const encoder = new MsgPackEncoderFast();
        const doc = encoder.encode(json);
        const decoder = new MsgPackDecoder();
        return () => {
          decoder.reader.reset(doc);
          return decoder.findIndex(5).findKey('value').findKey('json').findKey('tags').findIndex(1).val();
        };
      },
    },
    {
      name: 'MsgPackDecoder.find()',
      setup: (json) => {
        const {MsgPackEncoderFast} = require('../../es2020/json-pack/msgpack/MsgPackEncoderFast');
        const {MsgPackDecoder} = require('../../es2020/json-pack/msgpack/MsgPackDecoder');
        const encoder = new MsgPackEncoderFast();
        const doc = encoder.encode(json);
        const decoder = new MsgPackDecoder();
        return () => {
          decoder.reader.reset(doc);
          return decoder.find([5, 'value', 'json', 'tags', 1]).val();
        };
      },
    },
    {
      name: 'genShallowReader()(MsgPackDecoder)',
      setup: (json) => {
        const {MsgPackEncoderFast} = require('../../es2020/json-pack/msgpack/MsgPackEncoderFast');
        const {MsgPackDecoder} = require('../../es2020/json-pack/msgpack/MsgPackDecoder');
        const {genShallowReader} = require('../../es2020/json-pack/msgpack/shallow-read');
        const encoder = new MsgPackEncoderFast();
        const doc = encoder.encode(json);
        const fn = genShallowReader([5, 'value', 'json', 'tags', 1]);
        const decoder = new MsgPackDecoder();
        return () => {
          decoder.reader.reset(doc);
          fn(decoder);
          return decoder.val();
        };
      },
    },
  ],
};

runBenchmark(benchmark);
