import {TypeSystem} from '../../../system';
import {CborEncoder} from '../../../../json-pack/cbor/CborEncoder';
import {CborDecoder} from '../../../../json-pack/cbor/CborDecoder';
import {Type} from '../../../type';
import {testBinaryCodegen} from './testBinaryCodegen';
import {EncodingFormat} from '../../../../json-pack/constants';
import {Writer} from '../../../../util/buffers/Writer';

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
