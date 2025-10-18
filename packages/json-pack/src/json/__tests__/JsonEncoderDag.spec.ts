import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import {utf8} from '@jsonjoy.com/buffers/lib/strings';
import {JsonEncoderDag} from '../JsonEncoderDag';

const writer = new Writer(16);
const encoder = new JsonEncoderDag(writer);

describe('object', () => {
  test('shorter and smaller keys are sorted earlier', () => {
    const json = '{"aaaaaa":6,"aaaaab":7,"aaaaac":8,"aaaabb":9,"bbbbb":5,"cccc":4,"ddd":3,"ee":2,"f":1}';
    const data = JSON.parse(json);
    const encoded = encoder.encode(data);
    const json2 = Buffer.from(encoded).toString();
    expect(json2).toBe('{"f":1,"ee":2,"ddd":3,"cccc":4,"bbbbb":5,"aaaaaa":6,"aaaaab":7,"aaaaac":8,"aaaabb":9}');
  });
});

describe('Bytes', () => {
  test('can encode a simple buffer in object', () => {
    const buf = utf8`hello world`;
    const data = {foo: buf};
    const encoded = encoder.encode(data);
    const json = Buffer.from(encoded).toString();
    expect(json).toBe('{"foo":{"/":{"bytes":"aGVsbG8gd29ybGQ"}}}');
  });

  test('can encode a simple buffer in array', () => {
    const buf = utf8`hello world`;
    const data = [0, buf, 1];
    const encoded = encoder.encode(data);
    const json = Buffer.from(encoded).toString();
    expect(json).toBe('[0,{"/":{"bytes":"aGVsbG8gd29ybGQ"}},1]');
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

  const encoder = new IpfsEncoder(writer);

  test('can encode a CID as object key', () => {
    const data = {id: new CID('QmXn5v3z')};
    const encoded = encoder.encode(data);
    const json = Buffer.from(encoded).toString();
    expect(json).toBe('{"id":{"/":"QmXn5v3z"}}');
  });

  test('can encode a CID in array', () => {
    const data = ['a', new CID('b'), 'c'];
    const encoded = encoder.encode(data);
    const json = Buffer.from(encoded).toString();
    expect(json).toBe('["a",{"/":"b"},"c"]');
  });
});
