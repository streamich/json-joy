import {TypeSystem} from '../../../system';
import {Type} from '../../../type';
import {testBinaryCodegen} from './testBinaryCodegen';
import {EncodingFormat} from '@jsonjoy.com/json-pack/lib/constants';
import {JsonEncoder} from '@jsonjoy.com/json-pack/lib/json/JsonEncoder';
import {Writer} from '@jsonjoy.com/util/lib/buffers/Writer';
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
