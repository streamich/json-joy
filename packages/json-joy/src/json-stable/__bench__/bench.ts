import {runBenchmark} from '../../__bench__/runBenchmark';
import {stringify} from '..';

const benchmark = {
  name: 'Encoding',
  warmup: 10000,
  payloads: [
    {
      name: (json: any) => `Small object, ${JSON.stringify(json).length} bytes`,
      data: require('../../__bench__/data/json1'),
    },
    {
      name: (json: any) => `Typical object, ${JSON.stringify(json).length} bytes`,
      data: require('../../__bench__/data/json2'),
    },
    {
      name: (json: any) => `Large object, ${JSON.stringify(json).length} bytes`,
      data: require('../../__bench__/data/json3'),
    },
    {
      name: (json: any) => `Very large object, ${JSON.stringify(json).length} bytes`,
      data: require('../../__bench__/data/json6'),
    },
    {
      name: (json: any) => `Object with many keys, ${JSON.stringify(json).length} bytes`,
      data: require('../../__bench__/data/json-object-many-keys'),
    },
    {
      name: (json: any) => `String ladder, ${JSON.stringify(json).length} bytes`,
      data: require('../../__bench__/data/json-strings-ladder'),
    },
    {
      name: (json: any) => `Long strings, ${JSON.stringify(json).length} bytes`,
      data: require('../../__bench__/data/json-strings-long'),
    },
    {
      name: (json: any) => `Short strings, ${JSON.stringify(json).length} bytes`,
      data: require('../../__bench__/data/json-strings-short'),
    },
    {
      name: (json: any) => `Numbers, ${JSON.stringify(json).length} bytes`,
      data: require('../../__bench__/data/json-numbers'),
    },
    {
      name: (json: any) => `Tokens, ${JSON.stringify(json).length} bytes`,
      data: require('../../__bench__/data/json-tokens'),
    },
  ],
  runners: [
    {
      name: 'json-joy/json-stable',
      setup: (json: any) => {
        return () => stringify(json);
      },
    },
    {
      name: 'JSON.stringify()',
      setup: (json: any) => {
        return () => JSON.stringify(json);
      },
    },
    {
      name: 'fastest-stable-stringify',
      setup: (json: any) => {
        const stringify = require('safe-stable-stringify');
        return () => stringify(json);
      },
    },
    {
      name: 'safe-stable-stringify',
      setup: (json: any) => {
        const stringify = require('safe-stable-stringify');
        return () => stringify(json);
      },
    },
    {
      name: 'fast-stable-stringify',
      setup: (json: any) => {
        const stringify = require('fast-stable-stringify');
        return () => stringify(json);
      },
    },
  ],
};

runBenchmark(benchmark);
