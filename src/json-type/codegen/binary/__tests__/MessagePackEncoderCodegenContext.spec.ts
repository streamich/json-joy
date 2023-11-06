import {TypeSystem} from '../../../system';
import {MsgPackEncoder} from '../../../../json-pack/msgpack/MsgPackEncoder';
import {MsgPackDecoder} from '../../../../json-pack/msgpack/MsgPackDecoder';
import {Type} from '../../../type';
import {testBinaryCodegen} from './testBinaryCodegen';
import {EncodingFormat} from '../../../../json-pack/constants';
import {Writer} from '../../../../util/buffers/Writer';

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
