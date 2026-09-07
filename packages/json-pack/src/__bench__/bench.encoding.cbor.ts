// npx ts-node src/__bench__/bench.encoding.cbor.ts

import {type IBenchmark, runBenchmark} from '@jsonjoy.com/util/lib/bench/runBenchmark';
import {payloads} from '../__bench__/payloads';
import {CborEncoder} from '../cbor/CborEncoder';
import {CborEncoderFast} from '../cbor/CborEncoderFast';

const benchmark: IBenchmark = {
  name: 'Encoding',
  warmup: 1000,
  payloads,
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
      name: 'json-pack CborEncoderFast',
      setup: () => {
        const encoder = new CborEncoderFast();
        return (json: any) => encoder.encode(json);
      },
    },
    {
      name: 'json-pack CborEncoder',
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
