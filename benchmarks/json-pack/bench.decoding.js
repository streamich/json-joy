/**
 * NODE_ENV=production node --prof benchmarks/json-pack/bench.decoding.js
 * node --prof-process isolate-0xnnnnnnnnnnnn-v8.log
 */

const {runBenchmark} = require('../bench/runBenchmark');
const {CborEncoderFast} = require('../../es2020/json-pack/cbor/CborEncoderFast');
const {MsgPackEncoderFast} = require('../../es2020/json-pack/msgpack/MsgPackEncoderFast');
const json1 = require('../data/json1');
const json2 = require('../data/json2');
const json3 = require('../data/json3');
const json6 = require('../data/json6');
const json_object_many_keys = require('../data/json-object-many-keys');
const json_tokens = require('../data/json-tokens');
const json_numbers = require('../data/json-numbers');
const json_strings_short = require('../data/json-strings-short');
const json_strings_long = require('../data/json-strings-long');
const json_strings_ladder = require('../data/json-strings-ladder');
const sjson = require('secure-json-parse');

const cbor = new CborEncoderFast();
const msgpack = new MsgPackEncoderFast();

const benchmark = {
  name: 'Decoding',
  warmup: 1000,
  payloads: [
    {
      name: ({json}) => `Very large object, ${json.length} bytes`,
      data: {cbor: cbor.encode(json6), msgpack: msgpack.encode(json6), json: JSON.stringify(json6)},
      test: ({json}) => JSON.parse(json),
    },
    {
      name: ({json}) => `Large object, ${json.length} bytes`,
      data: {cbor: cbor.encode(json3), msgpack: msgpack.encode(json3), json: JSON.stringify(json3)},
      test: ({json}) => JSON.parse(json),
    },
    {
      name: ({json}) => `Typical object, ${json.length} bytes`,
      data: {cbor: cbor.encode(json2), msgpack: msgpack.encode(json2), json: JSON.stringify(json2)},
      test: ({json}) => JSON.parse(json),
    },
    {
      name: ({json}) => `Small object, ${json.length} bytes`,
      data: {cbor: cbor.encode(json1), msgpack: msgpack.encode(json1), json: JSON.stringify(json1)},
      test: ({json}) => JSON.parse(json),
    },
    {
      name: ({json}) => `Object with many keys, ${json.length} bytes`,
      data: {cbor: cbor.encode(json_object_many_keys), msgpack: msgpack.encode(json_object_many_keys), json: JSON.stringify(json_object_many_keys)},
      test: ({json}) => JSON.parse(json),
    },
    {
      name: ({json}) => `String ladder, ${json.length} bytes`,
      data: {cbor: cbor.encode(json_strings_ladder), msgpack: msgpack.encode(json_strings_ladder), json: JSON.stringify(json_strings_ladder)},
      test: ({json}) => JSON.parse(json),
    },
    {
      name: ({json}) => `Long strings, ${json.length} bytes`,
      data: {cbor: cbor.encode(json_strings_long), msgpack: msgpack.encode(json_strings_long), json: JSON.stringify(json_strings_long)},
      test: ({json}) => JSON.parse(json),
    },
    {
      name: ({json}) => `Short strings, ${json.length} bytes`,
      data: {cbor: cbor.encode(json_strings_short), msgpack: msgpack.encode(json_strings_short), json: JSON.stringify(json_strings_short)},
      test: ({json}) => JSON.parse(json),
    },
    {
      name: ({json}) => `Numbers, ${json.length} bytes`,
      data: {cbor: cbor.encode(json_numbers), msgpack: msgpack.encode(json_numbers), json: JSON.stringify(json_numbers)},
      test: ({json}) => JSON.parse(json),
    },
    {
      name: ({json}) => `Tokens, ${json.length} bytes`,
      data: {cbor: cbor.encode(json_tokens), msgpack: msgpack.encode(json_tokens), json: JSON.stringify(json_tokens)},
      test: ({json}) => JSON.parse(json),
    },
  ],
  runners: [
    {
      name: 'JSON.parse()',
      setup: ({json}) => {
        return () => JSON.parse(json);
      },
    },
    {
      name: 'sjson.parse()',
      setup: ({json}) => {
        return () => sjson.parse(json);
      },
    },
    {
      name: 'json-joy/json-pack CborDecoderBase',
      setup: ({cbor}) => {
        const {CborDecoderBase} = require('../../es2020/json-pack/cbor/CborDecoderBase');
        const decoder = new CborDecoderBase();
        return () => decoder.decode(cbor);
      },
    },
    {
      name: 'cbor-x',
      setup: ({cbor}) => {
        const {decode} = require('cbor-x');
        return () => decode(cbor);
      },
    },
    {
      name: 'cbor',
      setup: ({cbor}) => {
        const {decode} = require('cbor');
        return () => decode(cbor);
      },
    },
    {
      name: 'json-joy/json-pack MsgPackDecoderFast',
      setup: ({msgpack}) => {
        const {MsgPackDecoderFast} = require('../../es2020/json-pack/msgpack/MsgPackDecoderFast');
        const decoder = new MsgPackDecoderFast();
        return () => decoder.decode(msgpack);
      },
    },
    {
      name: 'msgpackr',
      setup: ({msgpack}) => {
        const {unpack} = require('msgpackr');
        return () => unpack(msgpack);
      },
    },
    {
      name: '@msgpack/msgpack',
      setup: ({msgpack}) => {
        const {Decoder} = require("@msgpack/msgpack");
        const decoder = new Decoder();
        return () => decoder.decode(msgpack);
      },
    },
    {
      name: 'msgpack5',
      setup: ({msgpack}) => {
        const {decode} = require('msgpack5')();
        return () => decode(msgpack);
      },
    },
    {
      name: 'msgpack-lite',
      setup: ({msgpack}) => {
        const {decode} = require("msgpack-lite");
        return () => decode(msgpack);
      },
    },
    {
      name: 'messagepack',
      setup: ({msgpack}) => {
        const {decode} = require("messagepack");
        return () => decode(msgpack);
      },
    },
  ],
};

runBenchmark(benchmark);
