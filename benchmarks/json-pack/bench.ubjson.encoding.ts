// npx ts-node benchmarks/json-pack/bench.ubjson.encoding.ts

import {runBenchmark, Benchmark} from '../bench/runBenchmark';
import {UbjsonEncoder} from '../../src/json-pack/ubjson/UbjsonEncoder';
import {Writer} from '../../src/util/buffers/Writer';
import {payloads} from './payloads';

const benchmark: Benchmark = {
  name: 'Encoding',
  warmup: 1000,
  payloads,
  runners: [
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
    // {
    //   name: 'Buffer.from(JSON.stringify())',
    //   setup: () => {
    //     return (json: any) => Buffer.from(JSON.stringify(json));
    //   },
    // },
  ],
};

runBenchmark(benchmark);
