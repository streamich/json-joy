import {readFileSync} from 'fs';
import {EncoderFull} from '../json-pack';
import * as JSONB from '../json-binary';

try {
  const encoder = new EncoderFull();
  const buf = readFileSync(0);
  const doc = JSONB.parse(buf.toString());
  const encoded = encoder.encode(doc);
  process.stdout.write(encoded);
} catch (error) {
  const output = error instanceof Error ? error.message : String(error);
  process.stderr.write(output + '\n');
  process.exit(1);
}
