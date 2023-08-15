// npx ts-node benchmarks/json-crdt/bench.encoding.ts

import {runBenchmark, IBenchmark} from '../../__bench__/runBenchmark';

const benchmark: IBenchmark = {
  name: 'Encoding',
  warmup: 1000,
  payloads: [
    {
      name: (json: any) => `Small object, ${JSON.stringify(json).length} bytes`,
      data: require('../data/json1'),
    },
    {
      name: (json: any) => `Typical object, ${JSON.stringify(json).length} bytes`,
      data: require('../data/json2'),
    },
    {
      name: (json: any) => `Large object, ${JSON.stringify(json).length} bytes`,
      data: require('../data/json3'),
    },
    {
      name: (json: any) => `Very large object, ${JSON.stringify(json).length} bytes`,
      data: require('../data/json6'),
    },
    {
      name: (json: any) => `Object with many keys, ${JSON.stringify(json).length} bytes`,
      data: require('../data/json-object-many-keys'),
    },
    {
      name: (json: any) => `String ladder, ${JSON.stringify(json).length} bytes`,
      data: require('../data/json-strings-ladder'),
    },
    {
      name: (json: any) => `Long strings, ${JSON.stringify(json).length} bytes`,
      data: require('../data/json-strings-long'),
    },
    {
      name: (json: any) => `Short strings, ${JSON.stringify(json).length} bytes`,
      data: require('../data/json-strings-short'),
    },
    {
      name: (json: any) => `Numbers, ${JSON.stringify(json).length} bytes`,
      data: require('../data/json-numbers'),
    },
    {
      name: (json: any) => `Tokens, ${JSON.stringify(json).length} bytes`,
      data: require('../data/json-tokens'),
    },
  ],
  runners: [
    // {
    //   name: 'JSON.stringify',
    //   setup: (json) => {
    //     return () => JSON.stringify(json);
    //   },
    // },
    // {
    //   name: 'json-joy/json-pack MsgPackEncoderFast',
    //   setup: (json) => {
    //     const {MsgPackEncoderFast} = require('../../es2020/json-pack/msgpack/MsgPackEncoderFast');
    //     const encoder = new MsgPackEncoderFast();
    //     return () => encoder.encode(json);
    //   },
    // },
    // {
    //   name: 'json-joy/json-crdt structural "binary" (server)',
    //   setup: (json) => {
    //     const {Model} = require('../../es2020/json-crdt');
    //     const {Encoder} = require('../../es2020/json-crdt/codec/structural/binary/Encoder');
    //     const model = Model.withServerClock();
    //     model.api.root(json);
    //     const encoder = new Encoder();
    //     return () => encoder.encode(model);
    //   },
    // },
    {
      name: 'json-joy/json-crdt structural "binary" (logical)',
      setup: (json: any) => {
        const {Model} = require('../../es2020/json-crdt');
        const {Encoder} = require('../../es2020/json-crdt/codec/structural/binary/Encoder');
        const model = Model.withLogicalClock();
        model.api.root(json);
        const encoder = new Encoder();
        return () => encoder.encode(model);
      },
    },
    // {
    //   name: 'json-joy/json-crdt indexed "binary"',
    //   setup: (json) => {
    //     const {Model} = require('../../es2020/json-crdt');
    //     const {Encoder} = require('../../es2020/json-crdt/codec/indexed/binary/Encoder');
    //     const model = Model.withLogicalClock();
    //     model.api.root(json);
    //     const encoder = new Encoder();
    //     return () => encoder.encode(model);
    //   },
    // },
    {
      name: 'Y.js',
      setup: (json: any) => {
        const Y = require('yjs');
        const jsonToYjsType = (json: any) => {
          if (!json) return json;
          if (typeof json === 'object') {
            if (Array.isArray(json)) {
              const arr = new Y.Array();
              arr.push(json.map(jsonToYjsType));
              return arr;
            }
            const obj = new Y.Map();
            for (const [key, value] of Object.entries(json)) obj.set(key, jsonToYjsType(value));
            return obj;
          }
          return json;
        };
        const ydoc = new Y.Doc();
        const ymap = ydoc.getMap();
        ymap.set('a', jsonToYjsType(json));
        return () => Y.encodeStateAsUpdate(ydoc);
      },
    },
  ],
};

runBenchmark(benchmark);
