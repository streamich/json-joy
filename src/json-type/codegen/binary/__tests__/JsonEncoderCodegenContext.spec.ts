import {TypeSystem} from '../../../system';
import {Type} from '../../../type';
import {testBinaryCodegen} from './testBinaryCodegen';
import {EncodingFormat} from '../../../../json-pack/constants';
import {JsonEncoder} from '../../../../json-pack/json/JsonEncoder';
import {Writer} from '../../../../util/buffers/Writer';
import {parse} from '../../../../json-binary';

const encoder = new JsonEncoder(new Writer(16));

const transcode = (system: TypeSystem, type: Type, value: unknown) => {
  const fn = type.encoder(EncodingFormat.Json);
  encoder.writer.reset();
  fn(value, encoder);
  const encoded = encoder.writer.flush();
  const json = Buffer.from(encoded).toString('utf-8');
  // console.log(json);
  const decoded = parse(json);
  return decoded;
};

testBinaryCodegen(transcode);
