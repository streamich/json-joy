// npx ts-node src/__bench__/bench.ubjson.encoding.ts

import {runBenchmark, type IBenchmark} from '../__bench__/runBenchmark';
import {UbjsonEncoder} from '../ubjson/UbjsonEncoder';
import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import {payloads} from '../__bench__/payloads';

const benchmark: IBenchmark = {
  name: 'Encoding',
  warmup: 1000,
  payloads,
  runners: [
    {
      name: 'json-pack UbjsonEncoder',
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
