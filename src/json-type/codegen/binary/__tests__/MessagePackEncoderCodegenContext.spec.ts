import {TypeSystem} from '../../../system';
import {MsgPackEncoder} from '@jsonjoy.com/json-pack/lib/msgpack/MsgPackEncoder';
import {MsgPackDecoder} from '@jsonjoy.com/json-pack/lib/msgpack/MsgPackDecoder';
import {Type} from '../../../type';
import {testBinaryCodegen} from './testBinaryCodegen';
import {EncodingFormat} from '@jsonjoy.com/json-pack/lib/constants';
import {Writer} from '@jsonjoy.com/util/lib/buffers/Writer';

const writer = new Writer(64);
const encoder = new MsgPackEncoder(writer);
const decoder = new MsgPackDecoder();

const transcode = (system: TypeSystem, type: Type, value: unknown) => {
  const fn = type.encoder(EncodingFormat.MsgPack);
  // console.log(fn.toString());
  encoder.writer.reset();
  fn(value, encoder);
  const encoded = encoder.writer.flush();
  const decoded = decoder.decode(encoded);
  return decoded;
};

testBinaryCodegen(transcode);
