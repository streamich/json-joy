import {TypeSystem} from '../../../system';
import {CborEncoder} from '@jsonjoy.com/json-pack/lib/cbor/CborEncoder';
import {CborDecoder} from '@jsonjoy.com/json-pack/lib/cbor/CborDecoder';
import {Type} from '../../../type';
import {testBinaryCodegen} from './testBinaryCodegen';
import {EncodingFormat} from '@jsonjoy.com/json-pack/lib/constants';
import {Writer} from '@jsonjoy.com/util/lib/buffers/Writer';

const writer = new Writer(1);
const encoder = new CborEncoder(writer);
const decoder = new CborDecoder();

const transcode = (system: TypeSystem, type: Type, value: unknown) => {
  const fn = type.encoder(EncodingFormat.Cbor);
  // console.log(fn.toString())
  // console.log(fn.toString());
  encoder.writer.reset();
  fn(value, encoder);
  const encoded = encoder.writer.flush();
  const decoded = decoder.decode(encoded);
  return decoded;
};

testBinaryCodegen(transcode);
