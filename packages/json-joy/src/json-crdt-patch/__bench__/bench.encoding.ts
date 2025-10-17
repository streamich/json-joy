// npx ts-node src/json-crdt-patch/__bench__/bench.encoding.ts

import {runBenchmark, type IBenchmark} from '../../__bench__/runBenchmark';
import json1 from '../../__tests__/fixtures/json/small-object';
import json2 from '../../__tests__/fixtures/json/simple-json-patch';
import {LogicalClock} from '../clock';
import type {Patch} from '../Patch';
import {PatchBuilder} from '../PatchBuilder';
import {encode as encodeBinary} from '../codec/binary';
import {encode as encodeCompact} from '../codec/compact-binary';
import {encode as encodeJson} from '../codec/verbose';
import {encode as encodeCbor} from '@jsonjoy.com/json-pack/lib/cbor/shared';

const createPatch = (json: any) => {
  const clock = new LogicalClock(123456, 0);
  const builder = new PatchBuilder(clock);
  builder.json(json);
  const patch = builder.flush();
  return patch;
};

const payloads: IBenchmark['payloads'] = [
  {
    name: 'small object',
    data: createPatch(json1),
  },
  {
    name: 'simple JSON Patch',
    data: createPatch(json2),
  },
];

const runners: IBenchmark['runners'] = [
  {
    name: (patch) => `binary (${encodeBinary(<Patch>patch).byteLength} bytes)`,
    setup: () => {
      return (patch: unknown) => {
        return encodeBinary(<Patch>patch);
      };
    },
  },
  {
    name: (patch) => `compact (${encodeCompact(<Patch>patch).byteLength} bytes)`,
    setup: () => {
      return (patch: unknown) => {
        return encodeCompact(<Patch>patch);
      };
    },
  },
  {
    name: (patch) => `json (${encodeCbor(encodeJson(<Patch>patch)).byteLength} bytes)`,
    setup: () => {
      return (patch: unknown) => {
        return encodeCbor(encodeJson(<Patch>patch));
      };
    },
  },
];

// for (const payload of payloads) {
//   const patch = payload.data as Patch;
//   console.log('---------------------------------------------------------------------------------------------------');
//   console.log(payload.name);
//   console.log('---------------------------------------------------------------------------------------------------');
//   console.log(patch + '');
//   for (const runner of runners) {
//     const buf = runner.setup(patch)(patch) as any as Uint8Array;
//     console.log(runner.name, buf.byteLength);
//   }
// }

const benchmark: IBenchmark = {
  name: 'JSON CRDT Patch encoding to Uint8Array',
  warmup: 1000,
  payloads,
  runners,
};

runBenchmark(benchmark);
