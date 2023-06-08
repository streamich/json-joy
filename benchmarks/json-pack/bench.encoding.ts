// npx ts-node benchmarks/json-pack/bench.encoding.ts

import {runBenchmark, Benchmark} from '../bench/runBenchmark';
import {JsonEncoder} from '../../src/json-pack/json/JsonEncoder';
import {UbjsonEncoder} from '../../src/json-pack/ubjson/UbjsonEncoder';
import {CborEncoderFast} from '../../src/json-pack/cbor/CborEncoderFast';
import {CborEncoder} from '../../src/json-pack/cbor/CborEncoder';
import {Writer} from '../../src/util/buffers/Writer';

const benchmark: Benchmark = {
  name: 'Encoding',
  warmup: 1000,
  payloads: [
    {
      name: json => `Small object, ${JSON.stringify(json).length} bytes`,
      data: require('../data/json1'),
    },
    {
      name: json => `Typical object, ${JSON.stringify(json).length} bytes`,
      data: require('../data/json2'),
    },
    {
      name: json => `Large object, ${JSON.stringify(json).length} bytes`,
      data: require('../data/json3'),
    },
    {
      name: json => `Very large object, ${JSON.stringify(json).length} bytes`,
      data: require('../data/json6'),
    },
    {
      name: json => `Object with many keys, ${JSON.stringify(json).length} bytes`,
      data: require('../data/json-object-many-keys'),
    },
    {
      name: json => `String ladder, ${JSON.stringify(json).length} bytes`,
      data: require('../data/json-strings-ladder'),
    },
    {
      name: json => `Long strings, ${JSON.stringify(json).length} bytes`,
      data: require('../data/json-strings-long'),
    },
    {
      name: json => `Short strings, ${JSON.stringify(json).length} bytes`,
      data: require('../data/json-strings-short'),
    },
    {
      name: json => `Numbers, ${JSON.stringify(json).length} bytes`,
      data: require('../data/json-numbers'),
    },
    {
      name: json => `Tokens, ${JSON.stringify(json).length} bytes`,
      data: require('../data/json-tokens'),
    },
  ],
  runners: [
    {
      name: 'json-joy/json-pack JsonEncoder',
      setup: () => {
        const writer = new Writer();
        const encoder = new JsonEncoder(writer);
        return (json: any) => encoder.encode(json);
      },
    },
    {
      name: 'json-joy/json-pack UbjsonEncoder',
      setup: () => {
        const writer = new Writer();
        const encoder = new UbjsonEncoder(writer);
        return (json: any) => encoder.encode(json);
      },
    },
    {
      name: '@shelacek/ubjson',
      setup: () => {
        const {encode} = require('@shelacek/ubjson');
        return (json: any) => encode(json);
      },
    },
    {
      name: 'Buffer.from(JSON.stringify())',
      setup: () => {
        return (json: any) => Buffer.from(JSON.stringify(json));
      },
    },
    {
      name: 'json-joy/json-pack CborEncoderFast',
      setup: () => {
        const encoder = new CborEncoderFast();
        return (json: any) => encoder.encode(json);
      },
    },
    {
      name: 'json-joy/json-pack CborEncoder',
      setup: () => {
        const encoder = new CborEncoder();
        return (json: any) => encoder.encode(json);
      },
    },
    {
      name: 'json-joy/json-pack MsgPackEncoderFast',
      setup: () => {
        const {MsgPackEncoderFast} = require('../../es2020/json-pack/msgpack/MsgPackEncoderFast');
        const encoder = new MsgPackEncoderFast();
        const jsonPack4 = encoder.encode.bind(encoder);
        return (json: any) => jsonPack4(json);
      },
    },
    {
      name: 'JSON.stringify()',
      setup: () => {
        return (json: any) => JSON.stringify(json);
      },
    },
    {
      name: '@msgpack/msgpack',
      setup: () => {
        const {encode} = require('@msgpack/msgpack');
        return (json: any) => encode(json);
      },
    },
    {
      name: 'msgpackr',
      setup: () => {
        const {Packr} = require('msgpackr');
        const packr = new Packr();
        return (json: any) => packr.pack(json);;
      },
    },
    {
      name: 'cbor-x',
      setup: () => {
        const {encode} = require('cbor-x');
        return (json: any) => encode(json);
      },
    },
    // {
    //   name: 'ion-js',
    //   setup: () => {
    //     const {makeBinaryWriter, dom} = require('ion-js');
    //     return (json: any) => {
    //       const writer = makeBinaryWriter();
    //       dom.Value.from(json).writeTo(writer);
    //       writer.close();
    //       return writer.getBytes();
    //     };
    //   },
    // },
    {
      name: 'msgpack-lite',
      setup: () => {
        const {encode} = require('msgpack-lite');
        return (json: any) => encode(json);
      },
    },
    {
      name: 'msgpack5',
      setup: () => {
        const {encode} = require('msgpack5')();
        return (json: any) => encode(json);
      },
    },
    // {
    //   name: 'cbor',
    //   setup: () => {
    //     const {encode} = require('cbor');
    //     return (json: any) => encode(json);
    //   },
    // },
    {
      name: 'messagepack',
      setup: () => {
        const {encode} = require('messagepack');
        return (json: any) => encode(json);
      },
    },
  ],
};

runBenchmark(benchmark);
