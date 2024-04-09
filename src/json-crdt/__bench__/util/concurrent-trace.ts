import * as path from 'path';
import * as fs from 'fs';
import {Patch} from '../../../json-crdt-patch';
import {CborDecoder} from '@jsonjoy.com/json-pack/lib/cbor/CborDecoder';
import {JsonDecoder} from '@jsonjoy.com/json-pack/lib/json/JsonDecoder';

export const loadConcurrentTrace = (traceName: string): [batch: Patch[], view: unknown] => {
  const root = path.resolve(__dirname, '..', '..', '..', '..');
  const dir = path.join(root, 'node_modules', 'json-crdt-traces', 'traces', 'text', 'concurrent', traceName);
  const patchFile = path.join(dir, 'patches.bin');
  const viewFile = path.join(dir, 'view.json');
  const buf = fs.readFileSync(patchFile);
  const viewBuf = fs.readFileSync(viewFile);
  const cborDecoder = new CborDecoder();
  const jsonDecoder = new JsonDecoder();
  const data = cborDecoder.read(buf) as Uint8Array[];
  const view = jsonDecoder.read(viewBuf);
  const batch = data.map((blob) => Patch.fromBinary(blob));
  return [batch, view];
};
