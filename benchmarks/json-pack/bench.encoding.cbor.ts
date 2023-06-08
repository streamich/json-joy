// npx ts-node benchmarks/json-pack/bench.encoding.cbor.ts

import {runBenchmark, Benchmark} from '../bench/runBenchmark';
import {CborEncoderFast} from '../../src/json-pack/cbor/CborEncoderFast';
import {CborEncoder} from '../../src/json-pack/cbor/CborEncoder';

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
      name: 'JSON.stringify()',
      setup: () => {
        return (json: any) => JSON.stringify(json);
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
      name: 'cbor-x',
      setup: () => {
        const {encode} = require('cbor-x');
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
      name: 'cbor-js',
      setup: () => {
        const {encode} = require('cbor-js');
        return (json: any) => encode(json);
      },
    },
    {
      name: 'cborg',
      setup: () => {
        const {encode} = require('cborg');
        return (json: any) => encode(json);
      },
    },
    {
      name: 'cbor-sync',
      setup: () => {
        const {encode} = require('cbor-sync');
        return (json: any) => encode(json);
      },
    },
  ],
};

runBenchmark(benchmark);
