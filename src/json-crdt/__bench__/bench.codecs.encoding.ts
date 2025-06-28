// npx ts-node src/json-crdt/__bench__/bench.codecs.encoding.ts

import {payloads} from '../../__bench__/payloads';
import {type IBenchmark, runBenchmarkAndSave} from '../../__bench__/runBenchmark';
import {Encoder as CompactEncoder} from '../codec/structural/compact/Encoder';
import {Encoder as VerboseEncoder} from '../codec/structural/verbose/Encoder';
import {Encoder as IndexedEncoder} from '../codec/indexed/binary/Encoder';
import {Encoder as SidecarEncoder} from '../codec/sidecar/binary/Encoder';
import {CborEncoder} from '@jsonjoy.com/json-pack/lib/cbor/CborEncoder';
import {Model} from '../model';

const cborEncoder = new CborEncoder();

const benchmark: IBenchmark = {
  name: 'Encoding - JSON CRDT codecs',
  description:
    'All structural encoding return `Uint8Array` as their result. The "compact" and "verbose" codecs first encode into POJO which then is encoded into binary using the CBOR encoder.' +
    '\n\n' +
    'The indexed encoding returns a map of `Uint8Array` values.' +
    '\n\n' +
    'The sidecar encoding returns a 2-tuple of `Uint8Array`: (1) CBOR encoded view; (2) CRDT metadata.',
  warmup: 1000,
  payloads,
  runners: [
    {
      name: 'structural > binary (with server clock)',
      setup: (json: any) => {
        const model = Model.withServerClock();
        model.api.set(json);
        return () => model.toBinary();
      },
    },
    {
      name: 'structural > binary (with logical clock)',
      setup: (json: any) => {
        const model = Model.withLogicalClock();
        model.api.set(json);
        return () => model.toBinary();
      },
    },
    {
      name: 'structural > compact (with server clock)',
      setup: (json: any) => {
        const model = Model.withServerClock();
        const encoder = new CompactEncoder();
        model.api.set(json);
        return () => cborEncoder.encode(encoder.encode(model));
      },
    },
    {
      name: 'structural > compact (with logical clock)',
      setup: (json: any) => {
        const model = Model.withLogicalClock();
        const encoder = new CompactEncoder();
        model.api.set(json);
        return () => cborEncoder.encode(encoder.encode(model));
      },
    },
    {
      name: 'structural > verbose (with server clock)',
      setup: (json: any) => {
        const model = Model.withServerClock();
        const encoder = new VerboseEncoder();
        model.api.set(json);
        return () => cborEncoder.encode(encoder.encode(model));
      },
    },
    {
      name: 'structural > verbose (with logical clock)',
      setup: (json: any) => {
        const model = Model.withLogicalClock();
        const encoder = new VerboseEncoder();
        model.api.set(json);
        return () => cborEncoder.encode(encoder.encode(model));
      },
    },
    {
      name: 'indexed (with server clock)',
      setup: (json: any) => {
        const model = Model.withServerClock();
        const encoder = new IndexedEncoder();
        model.api.set(json);
        return () => encoder.encode(model);
      },
    },
    {
      name: 'indexed (with logical clock)',
      setup: (json: any) => {
        const model = Model.withLogicalClock();
        const encoder = new IndexedEncoder();
        model.api.set(json);
        return () => encoder.encode(model);
      },
    },
    {
      name: 'sidecar (with server clock)',
      setup: (json: any) => {
        const model = Model.withServerClock();
        const encoder = new SidecarEncoder();
        model.api.set(json);
        return () => encoder.encode(model);
      },
    },
    {
      name: 'sidecar (with logical clock)',
      setup: (json: any) => {
        const model = Model.withLogicalClock();
        const encoder = new SidecarEncoder();
        model.api.set(json);
        return () => encoder.encode(model);
      },
    },
  ],
};

runBenchmarkAndSave(benchmark, __dirname + '/results');
