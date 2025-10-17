import {readFileSync} from 'fs';
import {MsgPackEncoder} from '@jsonjoy.com/json-pack/lib/msgpack';
import {CborEncoder} from '@jsonjoy.com/json-pack/lib/cbor/CborEncoder';
import * as JSONB from '@jsonjoy.com/json-pack/lib/json-binary';
import arg from 'arg';

const args = arg(
  {
    '--format': String,
    '--cbor': Boolean,
  },
  {
    argv: process.argv,
  },
);

type Format = 'msgpack' | 'messagepack' | 'cbor';
const ALLOWED_FORMATS: Set<Format> = new Set(['msgpack', 'messagepack', 'cbor']);

const format: Format = args['--cbor']
  ? 'cbor'
  : (String((args['--format'] as Format) ?? 'msgpack').toLowerCase() as Format);
if (!ALLOWED_FORMATS.has(format)) throw new Error(`Unknown format: ${format}`);

try {
  switch (format) {
    case 'msgpack':
    case 'messagepack': {
      const encoder = new MsgPackEncoder();
      const buf = readFileSync(0);
      const doc = JSONB.parse(buf.toString());
      const encoded = encoder.encode(doc);
      process.stdout.write(encoded);
      break;
    }
    case 'cbor': {
      const encoder = new CborEncoder();
      const buf = readFileSync(0);
      const doc = JSONB.parse(buf.toString());
      const encoded = encoder.encode(doc);
      process.stdout.write(encoded);
      break;
    }
  }
} catch (error) {
  const output = error instanceof Error ? error.message : String(error);
  process.stderr.write(output + '\n');
  process.exit(1);
}
