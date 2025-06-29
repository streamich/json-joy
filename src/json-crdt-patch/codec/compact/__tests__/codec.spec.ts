import {encode} from '../encode';
import {decode} from '../decode';
import {LogicalClock, Timestamp, ts, tss} from '../../../clock';
import {PatchBuilder} from '../../../PatchBuilder';
import {encode as encodeJson} from '../../verbose/encode';

test('can encode and decode a simple object', () => {
  const clock = new LogicalClock(3, 100);
  const builder = new PatchBuilder(clock);
  builder.json({
    foo: 'bar',
  });
  const encoded = encode(builder.patch);
  const decoded = decode(encoded);
  expect(decoded).toEqual(builder.patch);
});

test('can encode binary data', () => {
  const clock = new LogicalClock(5, 100);
  const builder = new PatchBuilder(clock);
  builder.json({
    foo: new Uint8Array([111]),
  });
  const encoded = encode(builder.patch);
  const decoded = decode(encoded);
  expect(decoded).toEqual(builder.patch);
});

test('can encode one element delete operation', () => {
  const clock = new LogicalClock(5, 100);
  const builder = new PatchBuilder(clock);
  builder.del(ts(5, 100), [tss(5, 200, 1)]);
  const encoded = encode(builder.patch);
  const decoded = decode(encoded);
  expect(decoded).toEqual(builder.patch);
});

test('can encode three element delete operation', () => {
  const clock = new LogicalClock(5, 100);
  const builder = new PatchBuilder(clock);
  builder.del(ts(5, 100), [tss(5, 200, 3)]);
  const encoded = encode(builder.patch);
  const decoded = decode(encoded);
  expect(encodeJson(decoded)).toEqual(encodeJson(builder.patch));
});

test('encodes a patch with all operation types', () => {
  const clock = new LogicalClock(3, 5);
  const builder = new PatchBuilder(clock);
  const assertCodec = () => {
    const encoded = encode(builder.patch);
    // console.log(encoded);
    const decoded = decode(encoded);
    expect(decoded).toStrictEqual(builder.patch);
  };
  builder.root(ts(0, 3));
  assertCodec();
  builder.obj();
  assertCodec();
  builder.arr();
  assertCodec();
  builder.str();
  assertCodec();
  builder.bin();
  assertCodec();
  builder.con(123);
  assertCodec();
  builder.con({foo: 'bar'});
  assertCodec();
  builder.insObj(ts(4, 1), [['asdf', ts(4, 4)]]);
  assertCodec();
  builder.insObj(ts(44, 123), [
    ['foo', ts(5, 5)],
    ['bar', ts(5, 6)],
  ]);
  assertCodec();
  builder.setVal(ts(999, 999), ts(5555, 555));
  assertCodec();
  builder.insStr(ts(4, 4), ts(2, 2), 'asdf');
  assertCodec();
  builder.insBin(ts(4, 4), ts(2, 2), new Uint8Array([1, 2, 3]));
  assertCodec();
  builder.insArr(ts(4, 4), ts(2, 2), [ts(3, 3)]);
  assertCodec();
  builder.insArr(ts(4, 4), ts(2, 2), [ts(3, 3), ts(4, 4)]);
  assertCodec();
  builder.del(ts(5, 4), [tss(1, 1, 1)]);
  assertCodec();
  builder.del(ts(5, 4), [tss(1, 1, 1), tss(2, 2, 2)]);
  assertCodec();
  builder.nop(1);
  assertCodec();
  builder.nop(5);
  assertCodec();
  builder.arr();
  assertCodec();
  builder.updArr(ts(1, 1), ts(2, 2), ts(3, 3));
  assertCodec();
});

test('supports consts with undefined value', () => {
  const clock = new LogicalClock(12345678, 123);
  const builder = new PatchBuilder(clock);
  const assertCodec = () => {
    const encoded = JSON.parse(JSON.stringify(encode(builder.patch)));
    const decoded = decode(encoded);
    expect(decoded).toStrictEqual(builder.patch);
  };
  builder.root(ts(0, 3));
  assertCodec();
  builder.obj();
  assertCodec();
  builder.con(undefined);
  assertCodec();
});

test('encodes new vector operations', () => {
  const clock = new LogicalClock(12345678, 123);
  const builder = new PatchBuilder(clock);
  const assertCodec = () => {
    const encoded = encode(builder.patch);
    const decoded = decode(encoded);
    expect(decoded).toStrictEqual(builder.patch);
  };
  const tupId = builder.vec();
  builder.root(tupId);
  assertCodec();
});

test('can set vector slots using object operations', () => {
  const clock = new LogicalClock(12345678, 123);
  const builder = new PatchBuilder(clock);
  const assertCodec = () => {
    const encoded = encode(builder.patch);
    const decoded = decode(encoded);
    expect(decoded).toStrictEqual(builder.patch);
  };
  const tupId = builder.vec();
  builder.root(tupId);
  builder.insVec(tupId, [[0, ts(1, 1)]]);
  assertCodec();
});

test('can encode an ID', () => {
  const clock = new LogicalClock(12345678, 123);
  const builder = new PatchBuilder(clock);
  const constId = builder.con(new Timestamp(555, 666));
  builder.root(constId);
  const encoded = JSON.stringify(encode(builder.patch));
  const decoded = decode(JSON.parse(encoded));
  expect((builder.patch.ops[0] as any).val).toBeInstanceOf(Timestamp);
  expect((decoded.ops[0] as any).val).toBeInstanceOf(Timestamp);
  expect(decoded + '').toBe(builder.patch + '');
});

test('can encode custom metadata', () => {
  const clock = new LogicalClock(12345678, 123);
  const builder = new PatchBuilder(clock);
  const constId = builder.con(new Timestamp(555, 666));
  builder.root(constId);
  const patch = builder.flush();
  patch.meta = {foo: 'bar'};
  const encoded = JSON.stringify(encode(patch));
  const decoded = decode(JSON.parse(encoded));
  expect(decoded.meta).toStrictEqual({foo: 'bar'});
});

test('metadata can be a falsy value', () => {
  const clock = new LogicalClock(12345678, 123);
  const builder = new PatchBuilder(clock);
  const constId = builder.con(new Timestamp(555, 666));
  builder.root(constId);
  const patch = builder.flush();
  patch.meta = false;
  const encoded = JSON.stringify(encode(patch));
  const decoded = decode(JSON.parse(encoded));
  expect(decoded.meta).toBe(false);
});
