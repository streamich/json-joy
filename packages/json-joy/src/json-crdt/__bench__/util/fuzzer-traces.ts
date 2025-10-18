import * as path from 'path';
import * as fs from 'fs';
import {Patch} from '../../../json-crdt-patch';
import {CborDecoder} from '@jsonjoy.com/json-pack/lib/cbor/CborDecoder';
import {Model} from '../../model';
import {bufferToUint8Array} from '@jsonjoy.com/buffers/lib/bufferToUint8Array';
import {jsonCrdtTracesDir} from './jsonCrdtTraces';

export const loadFuzzerTrace = (traceName: string): [batch: Patch[], model: Model] => {
  const dir = path.join(jsonCrdtTracesDir, 'traces', 'fuzzer', 'processed', traceName);
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
