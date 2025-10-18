import {JsonPackExtension} from '../../JsonPackExtension';
import {MsgPackEncoder} from '../MsgPackEncoder';
import {MsgPackDecoderFast} from '..';
import {JsonPackValue} from '../../JsonPackValue';

const encoder = new MsgPackEncoder();
const encode = (x: unknown) => encoder.encode(x);
const decoder = new MsgPackDecoderFast();
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

describe('Buffer', () => {
  test('supports Buffer instances', () => {
    const data = {foo: Buffer.from([3, 2, 1])};
    const encoded = encode(data);
    const decoded = decode(encoded);
    expect(decoded).toStrictEqual({foo: new Uint8Array([3, 2, 1])});
  });
});

describe('extensions', () => {
  test('can encode a 5 byte extension', () => {
    const ext = new JsonPackExtension(33, new Uint8Array([1, 2, 3, 4, 5]));
    const data = {foo: ext};
    const arr = encode(data);
    const res = decode(arr);
    expect(res).toEqual(data);
    expect((res as any).foo.tag).toBe(33);
    expect((res as any).foo.val).toEqual(new Uint8Array([1, 2, 3, 4, 5]));
    expect((res as any).foo).toBeInstanceOf(JsonPackExtension);
  });

  test('can encode a 1 byte extension', () => {
    const ext = new JsonPackExtension(32, new Uint8Array([5]));
    const data = {foo: ext};
    const arr = encode(data);
    const res = decode(arr);
    expect(res).toEqual(data);
    expect((res as any).foo.tag).toBe(32);
    expect((res as any).foo.val).toEqual(new Uint8Array([5]));
    expect((res as any).foo).toBeInstanceOf(JsonPackExtension);
  });

  test('can encode a 2 byte extension', () => {
    const ext = new JsonPackExtension(32, new Uint8Array([5, 0]));
    const data = {foo: ext};
    const arr = encode(data);
    const res = decode(arr);
    expect(res).toEqual(data);
    expect((res as any).foo.tag).toBe(32);
    expect((res as any).foo.val).toEqual(new Uint8Array([5, 0]));
    expect((res as any).foo).toBeInstanceOf(JsonPackExtension);
  });
});

describe('pre-computed value', () => {
  test('can encode a pre-computed value in an object', () => {
    const data = {foo: new JsonPackValue(encode(['gaga']))};
    const arr = encode(data);
    expect(arr).toEqual(encode({foo: ['gaga']}));
  });

  test('can encode a pre-computed value in an array', () => {
    const data = {foo: [1, new JsonPackValue(encode(['gaga']))]};
    const arr = encode(data);
    expect(arr).toEqual(encode({foo: [1, ['gaga']]}));
  });
});
