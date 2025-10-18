import {runBenchmark} from '../__bench__/runBenchmark';
import {CborDecoder} from '../cbor/CborDecoder';
import {CborEncoder} from '../cbor/CborEncoder';
import {MsgPackEncoderFast} from '../msgpack';
import {MsgPackDecoder} from '../msgpack/MsgPackDecoder';
import {genShallowReader} from '../msgpack/shallow-read';

const benchmark = {
  name: 'Encoding',
  warmup: 10000,
  payloads: [
    {
      name: (json: any) => `Typical object, ${JSON.stringify(json).length} bytes`,
      data: require('../../__bench__/data/json2'),
      test: () => 'Sports 🏀',
    },
  ],
  runners: [
    {
      name: 'JSON.parse()',
      setup: (json: any) => {
        const doc = JSON.stringify(json);
        return () => {
          const parsed = JSON.parse(doc);
          return parsed[5]?.value?.json?.tags[1];
        };
      },
    },
    {
      name: 'msgpackr',
      setup: (json: any) => {
        const {decode} = require('msgpackr');
        const encoder = new MsgPackEncoderFast();
        const doc = encoder.encode(json);
        return () => {
          const parsed = decode(doc);
          return parsed[5]?.value?.json?.tags[1];
        };
      },
    },
    {
      name: 'cbor-x',
      setup: (json: any) => {
        const {decode} = require('cbor-x');
        const encoder = new CborEncoder();
        const doc = encoder.encode(json);
        return () => {
          const parsed = decode(doc);
          return parsed[5]?.value?.json?.tags[1];
        };
      },
    },
    {
      name: 'MsgPackDecoder',
      setup: (json: any) => {
        const encoder = new MsgPackEncoderFast();
        const doc = encoder.encode(json);
        const decoder = new MsgPackDecoder();
        return () => {
          const parsed = decoder.decode(doc) as any;
          return parsed[5]?.value?.json?.tags[1];
        };
      },
    },
    {
      name: 'CborDecoder',
      setup: (json: any) => {
        const encoder = new CborEncoder();
        const doc = encoder.encode(json);
        const decoder = new CborDecoder();
        return () => {
          const parsed = decoder.decode(doc) as any;
          return parsed[5]?.value?.json?.tags[1];
        };
      },
    },
    {
      name: 'MsgPackDecoder.{findKey,findIndex}()',
      setup: (json: any) => {
        const encoder = new MsgPackEncoderFast();
        const doc = encoder.encode(json);
        const decoder = new MsgPackDecoder();
        return () => {
          decoder.reader.reset(doc);
          return decoder.findIndex(5).findKey('value').findKey('json').findKey('tags').findIndex(1).readAny();
        };
      },
    },
    {
      name: 'MsgPackDecoder.find()',
      setup: (json: any) => {
        const encoder = new MsgPackEncoderFast();
        const doc = encoder.encode(json);
        const decoder = new MsgPackDecoder();
        return () => {
          decoder.reader.reset(doc);
          return decoder.find([5, 'value', 'json', 'tags', 1]).readAny();
        };
      },
    },
    {
      name: 'genShallowReader()(MsgPackDecoder)',
      setup: (json: any) => {
        const encoder = new MsgPackEncoderFast();
        const doc = encoder.encode(json);
        const fn = genShallowReader([5, 'value', 'json', 'tags', 1]);
        const decoder = new MsgPackDecoder();
        return () => {
          decoder.reader.reset(doc);
          fn(decoder);
          return decoder.readAny();
        };
      },
    },
  ],
};

runBenchmark(benchmark);
