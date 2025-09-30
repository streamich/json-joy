import {readFileSync} from 'fs';
import {MsgPackDecoderFast} from '@jsonjoy.com/json-pack/lib/msgpack';
// Apply runtime patch for CBOR decoder issue #925
import '../util/cbor-decoder-fix';
import {CborDecoder} from '@jsonjoy.com/json-pack/lib/cbor/CborDecoder';
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
      const decoder = new MsgPackDecoderFast();
      const buf = readFileSync(0);
      const arr = new Uint8Array(buf.length);
      for (let i = 0; i < buf.length; i++) arr[i] = buf[i];
      const decoded = decoder.decode(arr);
      const json = JSONB.stringify(decoded);
      process.stdout.write(json);
      break;
    }
    case 'cbor': {
      const decoder = new CborDecoder();
      const buf = readFileSync(0);
      const arr = new Uint8Array(buf.length);
      for (let i = 0; i < buf.length; i++) arr[i] = buf[i];
      const decoded = decoder.decode(arr);
      const json = JSONB.stringify(decoded);
      process.stdout.write(json);
      break;
    }
  }
} catch (error) {
  const output = error instanceof Error ? error.message : String(error);
  process.stderr.write(output + '\n');
  process.exit(1);
}
