import * as path from 'path';
import * as fs from 'fs';
import {Patch} from '../../../json-crdt-patch';
import {CborDecoder} from '@jsonjoy.com/json-pack/lib/cbor/CborDecoder';
import {Model} from '../../model';
import {bufferToUint8Array} from '@jsonjoy.com/util/lib/buffers/bufferToUint8Array';

export const loadFuzzerTrace = (traceName: string): [batch: Patch[], model: Model] => {
  const root = path.resolve(__dirname, '..', '..', '..', '..');
  const dir = path.join(root, 'node_modules', 'json-crdt-traces', 'traces', 'fuzzer', 'processed', traceName);
  const patchFile = path.join(dir, 'patches.bin');
  const modelFile = path.join(dir, 'model.bin');
  const buf = fs.readFileSync(patchFile);
  const modelBuf = bufferToUint8Array(fs.readFileSync(modelFile));
  const model = Model.fromBinary(modelBuf);
  const cborDecoder = new CborDecoder();
  const data = cborDecoder.read(buf) as Uint8Array[];
  const batch = data.map((blob) => Patch.fromBinary(blob));
  return [batch, model];
};
