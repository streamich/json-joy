/* tslint:disable no-console */

import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import {CborEncoder} from '@jsonjoy.com/json-pack/lib/cbor/CborEncoder';
import {EncodingFormat} from '@jsonjoy.com/json-pack/lib/constants';
import {JsonEncoder} from '@jsonjoy.com/json-pack/lib/json/JsonEncoder';
import {ModuleType} from '..';
import type {CompiledBinaryEncoder} from '../codegen/types';

const system = new ModuleType();
const {t} = system;

const response = system.alias(
  'Response',
  t.Object(
    t.Key(
      'collection',
      t.Object(
        t.Key('id', t.String({ascii: true, noJsonEscape: true})),
        t.Key('ts', t.num.options({format: 'u64'})),
        t.Key('cid', t.String({ascii: true, noJsonEscape: true})),
        t.Key('prid', t.String({ascii: true, noJsonEscape: true})),
        t.Key('slug', t.String({ascii: true, noJsonEscape: true})),
        t.KeyOpt('name', t.str),
        t.KeyOpt('src', t.str),
        t.KeyOpt('doc', t.str),
        t.KeyOpt('longText', t.str),
        t.Key('active', t.bool),
        t.Key('views', t.Array(t.num)),
      ),
    ),
    t.Key(
      'block',
      t.Object(
        t.Key('id', t.String({ascii: true, noJsonEscape: true})),
        t.Key('ts', t.num.options({format: 'u64'})),
        t.Key('cid', t.String({ascii: true, noJsonEscape: true})),
        t.Key('slug', t.String({ascii: true, noJsonEscape: true})),
      ),
    ),
  ),
);

const json = {
  collection: {
    id: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    ts: Date.now(),
    cid: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    prid: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    slug: 'slug-name',
    name: 'Super collection',
    src: '{"foo": "bar"}',
    longText:
      'After implementing a workaround for the first issue and merging the changes to another feature branch with some extra code and tests, the following error was printed in the stage’s log “JavaScript heap out of memory error.”',
    active: true,
    views: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  },
  block: {
    id: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    ts: Date.now(),
    cid: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    slug: 'slug-name',
  },
};

const jsonTextEncoder = response.type.jsonTextEncoder();
const jsonEncoderFn = response.type.encoder(EncodingFormat.Json) as CompiledBinaryEncoder;
const cborEncoderFn = response.type.encoder(EncodingFormat.Cbor) as CompiledBinaryEncoder;

const jsonEncoder = new JsonEncoder(new Writer());
const cborEncoder = new CborEncoder();

const {Suite} = require('benchmark');
const suite = new Suite();
suite
  .add(`json-type "json" text encoder and Buffer.from()`, () => {
    Buffer.from(jsonTextEncoder(json));
  })
  .add(`json-type "json" encoder`, () => {
    jsonEncoderFn(json, jsonEncoder);
    jsonEncoder.writer.flush();
  })
  .add(`json-type "cbor" encoder`, () => {
    cborEncoderFn(json, cborEncoder);
    cborEncoder.writer.flush();
  })
  .add(`json-pack CborEncoder`, () => {
    cborEncoder.encode(json);
  })
  .add(`Buffer.from(JSON.stringify())`, () => {
    Buffer.from(JSON.stringify(json));
  })
  .on('cycle', (event: any) => {
    console.log(String(event.target) + `, ${Math.round(1000000000 / event.target.hz)} ns/op`);
  })
  .on('complete', () => {
    console.log('Fastest is ' + suite.filter('fastest').map('name'));
  })
  .run();

// console.log(response.encoder('json').toString());
// console.log(response.encoder('cbor').toString());
