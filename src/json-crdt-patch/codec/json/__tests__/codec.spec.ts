import {LogicalClock, Timestamp, ts, tss} from '../../../clock';
import {PatchBuilder} from '../../../PatchBuilder';
import {encode} from '../encode';
import {decode} from '../decode';

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
  builder.const(123);
  assertCodec();
  builder.const({foo: 'bar'});
  assertCodec();
  builder.setKeys(ts(4, 1), [['asdf', ts(4, 4)]]);
  assertCodec();
  builder.setKeys(ts(44, 123), [
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
  builder.noop(1);
  assertCodec();
  builder.noop(5);
  assertCodec();
  builder.arr();
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
  builder.const(undefined);
  assertCodec();
});

test('encodes new tuple operations', () => {
  const clock = new LogicalClock(12345678, 123);
  const builder = new PatchBuilder(clock);
  const assertCodec = () => {
    const encoded = encode(builder.patch);
    const decoded = decode(encoded);
    expect(decoded).toStrictEqual(builder.patch);
  };
  const tupId = builder.tup();
  builder.root(tupId);
  assertCodec();
});

test('can set tuple slots using object operations', () => {
  const clock = new LogicalClock(12345678, 123);
  const builder = new PatchBuilder(clock);
  const assertCodec = () => {
    const encoded = encode(builder.patch);
    const decoded = decode(encoded);
    expect(decoded).toStrictEqual(builder.patch);
  };
  const tupId = builder.tup();
  builder.root(tupId);
  builder.setKeys(tupId, [[0, ts(1, 1)]]);
  assertCodec();
});

test('can encode an ID', () => {
  const clock = new LogicalClock(12345678, 123);
  const builder = new PatchBuilder(clock);
  const constId = builder.const(new Timestamp(555, 666));
  builder.root(constId);
  const encoded = JSON.stringify(encode(builder.patch));
  const decoded = decode(JSON.parse(encoded));
  expect((builder.patch.ops[0] as any).val).toBeInstanceOf(Timestamp);
  expect((decoded.ops[0] as any).val).toBeInstanceOf(Timestamp);
  expect(decoded + '').toBe(builder.patch + '');
});
