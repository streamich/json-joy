// npx ts-node src/__bench__/bench.encoding.ts

import {runBenchmark, type IBenchmark} from '../__bench__/runBenchmark';
import {JsonEncoder} from '../json/JsonEncoder';
import {UbjsonEncoder} from '../ubjson/UbjsonEncoder';
import {CborEncoderFast} from '../cbor/CborEncoderFast';
import {CborEncoder} from '../cbor/CborEncoder';
import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import {payloads} from '../__bench__/payloads';
import {MsgPackEncoderFast} from '../msgpack';

const benchmark: IBenchmark = {
  name: 'Encoding',
  warmup: 1000,
  payloads,
  runners: [
    {
      name: 'json-pack JsonEncoder',
      setup: () => {
        const writer = new Writer();
        const encoder = new JsonEncoder(writer);
        return (json: any) => encoder.encode(json);
      },
    },
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
      name: 'json-pack MsgPackEncoderFast',
      setup: () => {
        const encoder = new MsgPackEncoderFast();
        const jsonPack4 = encoder.encode.bind(encoder);
        return (json: any) => jsonPack4(json);
      },
    },
    {
      name: 'JSON.stringify()',
      setup: () => {
        return (json: any) => JSON.stringify(json);
      },
    },
    {
      name: '@msgpack/msgpack',
      setup: () => {
        const {encode} = require('@msgpack/msgpack');
        return (json: any) => encode(json);
      },
    },
    {
      name: 'msgpackr',
      setup: () => {
        const {Packr} = require('msgpackr');
        const packr = new Packr();
        return (json: any) => packr.pack(json);
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
    //   name: 'ion-js',
    //   setup: () => {
    //     const {makeBinaryWriter, dom} = require('ion-js');
    //     return (json: any) => {
    //       const writer = makeBinaryWriter();
    //       dom.Value.from(json).writeTo(writer);
    //       writer.close();
    //       return writer.getBytes();
    //     };
    //   },
    // },
    {
      name: 'msgpack-lite',
      setup: () => {
        const {encode} = require('msgpack-lite');
        return (json: any) => encode(json);
      },
    },
    {
      name: 'msgpack5',
      setup: () => {
        const {encode} = require('msgpack5')();
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
      name: 'messagepack',
      setup: () => {
        const {encode} = require('messagepack');
        return (json: any) => encode(json);
      },
    },
  ],
};

runBenchmark(benchmark);
