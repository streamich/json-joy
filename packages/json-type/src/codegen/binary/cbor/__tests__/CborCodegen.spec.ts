import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import {CborDecoder} from '@jsonjoy.com/json-pack/lib/cbor/CborDecoder';
import {CborEncoder} from '@jsonjoy.com/json-pack/lib/cbor/CborEncoder';
import {ModuleType} from '../../../../type/classes/ModuleType';
import {testBinaryCodegen} from '../../__tests__/testBinaryCodegen';
import {CborCodegen} from '../CborCodegen';
import {unknown, Value} from '../../../../value';
import type {Type} from '../../../../type';

const encoder = new CborEncoder(new Writer(16));
const decoder = new CborDecoder();

describe('inline Value', () => {
  test('can encode "any" field', () => {
    const {t} = new ModuleType();
    const type = t.object({foo: t.any});
    const fn = CborCodegen.get(type);
    encoder.writer.reset();
    fn({foo: true}, encoder);
    const encoded = encoder.writer.flush();
    const decoded = decoder.decode(encoded);
    expect(decoded).toEqual({foo: true});
  });

  test('can encode anon Value<unknown>', () => {
    const {t} = new ModuleType();
    const type = t.object({foo: t.any});
    const fn = CborCodegen.get(type);
    encoder.writer.reset();
    const value = unknown('test');
    fn({foo: value}, encoder);
    const encoded = encoder.writer.flush();
    const decoded = decoder.decode(encoded);
    expect(decoded).toEqual({foo: 'test'});
  });

  test('can encode typed Value<T>', () => {
    const {t} = new ModuleType();
    const type = t.object({foo: t.any});
    const fn = CborCodegen.get(type);
    encoder.writer.reset();
    const value = new Value(123, t.con(123));
    fn({foo: value}, encoder);
    const encoded = encoder.writer.flush();
    const decoded = decoder.decode(encoded);
    expect(decoded).toEqual({foo: 123});
  });
});

const transcode = (system: ModuleType, type: Type, value: unknown) => {
  const fn = CborCodegen.get(type);
  encoder.writer.reset();
  fn(value, encoder);
  const encoded = encoder.writer.flush();
  const decoded = decoder.decode(encoded);
  return decoded;
};

testBinaryCodegen(transcode);
