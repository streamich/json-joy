// npx ts-node src/json-crdt/__bench__/bench.codecs.decoding.ts

import {payloads} from '../../__bench__/payloads';
import {type IBenchmark, runBenchmarkAndSave} from '../../__bench__/runBenchmark';
import {Encoder as CompactEncoder} from '../codec/structural/compact/Encoder';
import {Decoder as CompactDecoder} from '../codec/structural/compact/Decoder';
import {Encoder as VerboseEncoder} from '../codec/structural/verbose/Encoder';
import {Decoder as VerboseDecoder} from '../codec/structural/verbose/Decoder';
import {Encoder as IndexedEncoder} from '../codec/indexed/binary/Encoder';
import {Decoder as IndexedDecoder} from '../codec/indexed/binary/Decoder';
import {Encoder as SidecarEncoder} from '../codec/sidecar/binary/Encoder';
import {Decoder as SidecarDecoder} from '../codec/sidecar/binary/Decoder';
import {CborEncoder} from '@jsonjoy.com/json-pack/lib/cbor/CborEncoder';
import {CborDecoder} from '@jsonjoy.com/json-pack/lib/cbor/CborDecoder';
import {Model} from '../model';

const cborEncoder = new CborEncoder();
const cborDecoder = new CborDecoder();

const benchmark: IBenchmark = {
  name: 'Decoding - JSON CRDT codecs',
  description: '',
  warmup: 1000,
  payloads,
  runners: [
    {
      name: 'structural > binary (with server clock)',
      setup: (json: any) => {
        const model = Model.withServerClock();
        model.api.set(json);
        const blob = model.toBinary();
        return () => Model.fromBinary(blob);
      },
    },
    {
      name: 'structural > binary (with logical clock)',
      setup: (json: any) => {
        const model = Model.withLogicalClock();
        model.api.set(json);
        const blob = model.toBinary();
        return () => Model.fromBinary(blob);
      },
    },
    {
      name: 'structural > compact (with server clock)',
      setup: (json: any) => {
        const model = Model.withServerClock();
        const encoder = new CompactEncoder();
        model.api.set(json);
        const blob = cborEncoder.encode(encoder.encode(model));
        const decoder = new CompactDecoder();
        return () => decoder.decode(cborDecoder.read(blob) as any);
      },
    },
    {
      name: 'structural > compact (with logical clock)',
      setup: (json: any) => {
        const model = Model.withLogicalClock();
        const encoder = new CompactEncoder();
        model.api.set(json);
        const blob = cborEncoder.encode(encoder.encode(model));
        const decoder = new CompactDecoder();
        return () => decoder.decode(cborDecoder.read(blob) as any);
      },
    },
    {
      name: 'structural > verbose (with server clock)',
      setup: (json: any) => {
        const model = Model.withServerClock();
        const encoder = new VerboseEncoder();
        model.api.set(json);
        const blob = cborEncoder.encode(encoder.encode(model));
        const decoder = new VerboseDecoder();
        return () => decoder.decode(cborDecoder.read(blob) as any);
      },
    },
    {
      name: 'structural > verbose (with logical clock)',
      setup: (json: any) => {
        const model = Model.withLogicalClock();
        const encoder = new VerboseEncoder();
        model.api.set(json);
        const blob = cborEncoder.encode(encoder.encode(model));
        const decoder = new VerboseDecoder();
        return () => decoder.decode(cborDecoder.read(blob) as any);
      },
    },
    {
      name: 'indexed (with server clock)',
      setup: (json: any) => {
        const model = Model.withServerClock();
        const encoder = new IndexedEncoder();
        model.api.set(json);
        const encoded = encoder.encode(model);
        const decoder = new IndexedDecoder();
        return () => decoder.decode(encoded);
      },
    },
    {
      name: 'indexed (with logical clock)',
      setup: (json: any) => {
        const model = Model.withLogicalClock();
        const encoder = new IndexedEncoder();
        model.api.set(json);
        const encoded = encoder.encode(model);
        const decoder = new IndexedDecoder();
        return () => decoder.decode(encoded);
      },
    },
    {
      name: 'sidecar (with server clock)',
      setup: (json: any) => {
        const model = Model.withServerClock();
        const encoder = new SidecarEncoder();
        model.api.set(json);
        const [viewBlob, encoded] = encoder.encode(model);
        const decoder = new SidecarDecoder();
        return () => {
          const view = cborDecoder.read(viewBlob) as any;
          return decoder.decode(view, encoded);
        };
      },
    },
    {
      name: 'sidecar (with logical clock)',
      setup: (json: any) => {
        const model = Model.withLogicalClock();
        const encoder = new SidecarEncoder();
        model.api.set(json);
        const [viewBlob, encoded] = encoder.encode(model);
        const decoder = new SidecarDecoder();
        return () => {
          const view = cborDecoder.read(viewBlob) as any;
          return decoder.decode(view, encoded);
        };
      },
    },
  ],
};

runBenchmarkAndSave(benchmark, __dirname + '/results');
