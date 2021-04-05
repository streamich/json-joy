import {JsonPackExtension} from '../../JsonPackExtension';
import {EncoderFull} from '..';
import {Decoder} from '../..';

const encoder = new EncoderFull();
const encode = (x: unknown) => encoder.encode(x);
const decoder = new Decoder();
const decode = (a: Uint8Array) => decoder.decode(a);

describe('binary', () => {
  test('can encode a simple Uin8Array', () => {
    const data = {foo: new Uint8Array([3, 2, 1])};
    const arr = encode(data);
    const res = decode(arr);
    expect(res).toEqual(data);
    expect((res as any).foo).toBeInstanceOf(Uint8Array);
  });
});

describe('extensions', () => {
  test('can encode a 5 byte extension', () => {
    const ext = new JsonPackExtension(33, new Uint8Array([1, 2, 3, 4, 5]));
    const data = {foo: ext};
    const arr = encode(data);
    const res = decode(arr);
    expect(res).toEqual(data);
    expect((res as any).foo.type).toBe(33);
    expect((res as any).foo.buf).toEqual(new Uint8Array([1, 2, 3, 4, 5]));
    expect((res as any).foo).toBeInstanceOf(JsonPackExtension);
  });

  test('can encode a 1 byte extension', () => {
    const ext = new JsonPackExtension(32, new Uint8Array([5]));
    const data = {foo: ext};
    const arr = encode(data);
    const res = decode(arr);
    expect(res).toEqual(data);
    expect((res as any).foo.type).toBe(32);
    expect((res as any).foo.buf).toEqual(new Uint8Array([5]));
    expect((res as any).foo).toBeInstanceOf(JsonPackExtension);
  });

  test('can encode a 2 byte extension', () => {
    const ext = new JsonPackExtension(32, new Uint8Array([5, 0]));
    const data = {foo: ext};
    const arr = encode(data);
    const res = decode(arr);
    expect(res).toEqual(data);
    expect((res as any).foo.type).toBe(32);
    expect((res as any).foo.buf).toEqual(new Uint8Array([5, 0]));
    expect((res as any).foo).toBeInstanceOf(JsonPackExtension);
  });
});
