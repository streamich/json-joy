import {readFileSync} from 'fs';
import {Decoder} from '../json-pack';
import * as JSONB from '../json-binary';

try {
  const decoder = new Decoder();
  const buf = readFileSync(0);
  const arr = new Uint8Array(buf.byteLength);
  for (let i = 0; i < buf.byteLength; i++) arr[i] = buf[i];
  const decoded = decoder.decode(arr);
  const json = JSONB.stringify(decoded);
  process.stdout.write(json);
} catch (error) {
  const output = error instanceof Error ? error.message : String(error);
  process.stderr.write(output + '\n');
  process.exit(1);
}
