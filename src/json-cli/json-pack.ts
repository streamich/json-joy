import {readFileSync} from 'fs';
import {EncoderFull} from '../json-pack';

try {
  const encoder = new EncoderFull();
  const buf = readFileSync(0);
  const doc = JSON.parse(buf.toString())
  const encoded = encoder.encode(doc);
  process.stdout.write(encoded);
} catch (error) {
  const output = error instanceof Error ? error.message : String(error);
  process.stderr.write(output + '\n');
  process.exit(1);
}
