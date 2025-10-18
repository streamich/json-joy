import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import {utf8} from '@jsonjoy.com/buffers/lib/strings';
import {JsonEncoderDag} from '../JsonEncoderDag';
import {JsonDecoderDag} from '../JsonDecoderDag';

const writer = new Writer(16);
const encoder = new JsonEncoderDag(writer);
const decoder = new JsonDecoderDag();

describe('Bytes', () => {
  test('can decode a simple buffer in object', () => {
    const buf = utf8`hello world`;
    const data = {foo: buf};
    const encoded = encoder.encode(data);
    const decoded = decoder.decode(encoded);
    expect(decoded).toEqual(data);
  });

  test('can decode buffers inside an array', () => {
    const data = [0, utf8``, utf8`asdf`, 1];
    const encoded = encoder.encode(data);
    const decoded = decoder.decode(encoded);
    expect(decoded).toEqual(data);
  });

  test('can decode buffer with whitespace surrounding literals', () => {
    const json = '  { "foo"  : {  "/"    :  {   "bytes" :    "aGVsbG8gd29ybGQ" }  }    }  ';
    const encoded = Buffer.from(json);
    const decoded = decoder.decode(encoded);
    expect(decoded).toEqual({foo: utf8`hello world`});
  });
});

describe('Cid', () => {
  class CID {
    constructor(public readonly value: string) {}
  }

  class IpfsEncoder extends JsonEncoderDag {
    public writeUnknown(value: unknown): void {
      if (value instanceof CID) return this.writeCid(value.value);
      else super.writeUnknown(value);
    }
  }

  class IpfsDecoder extends JsonDecoderDag {
    public readCid(cid: string): unknown {
      return new CID(cid);
    }
  }

  const encoder = new IpfsEncoder(writer);
  const decoder = new IpfsDecoder();

  test('can decode a single CID', () => {
    const data = new CID('Qm');
    const encoded = encoder.encode(data);
    const decoded = decoder.decode(encoded);
    expect(decoded).toEqual(data);
  });

  test('can decode a CID in object and array', () => {
    const data = {
      foo: 'bar',
      baz: new CID('Qm'),
      qux: [new CID('bu'), 'quux'],
    };
    const encoded = encoder.encode(data);
    const decoded = decoder.decode(encoded);
    expect(decoded).toEqual(data);
  });
});
