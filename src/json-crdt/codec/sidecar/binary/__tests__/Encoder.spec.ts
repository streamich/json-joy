import {s} from '../../../../../json-crdt-patch';
import {CborDecoder} from '@jsonjoy.com/json-pack/lib/cbor/CborDecoder';
import {Model} from '../../../../model';
import {Encoder} from '../Encoder';
import {Decoder} from '../Decoder';
import {Timestamp} from '../../../../../json-crdt-patch/clock';

test('con', () => {
  const model = Model.create();
  const encoder = new Encoder();
  const decoder = new Decoder();
  const cborDecoder = new CborDecoder();
  model.api.set(s.con(123));
  const [view, meta] = encoder.encode(model);
  const viewDecoded = cborDecoder.decode(view);
  const decoded = decoder.decode(viewDecoded, meta);
  expect(model.view()).toEqual(decoded.view());
  expect(model.view()).toEqual(viewDecoded);
  expect(decoded.clock.sid).toBe(model.clock.sid);
  expect(decoded.clock.time).toBe(model.clock.time);
});

test('con - timestamp', () => {
  const model = Model.create();
  const encoder = new Encoder();
  const decoder = new Decoder();
  const cborDecoder = new CborDecoder();
  model.api.set(s.con(new Timestamp(666, 1)));
  const [view, meta] = encoder.encode(model);
  const viewDecoded = cborDecoder.decode(view);
  const decoded = decoder.decode(viewDecoded, meta);
  expect(model.view()).toEqual(decoded.view());
  expect(viewDecoded).toEqual(null);
  expect(decoded.clock.sid).toBe(model.clock.sid);
  expect(decoded.clock.time).toBe(model.clock.time);
});

test('val', () => {
  const model = Model.create();
  const encoder = new Encoder();
  const decoder = new Decoder();
  const cborDecoder = new CborDecoder();
  model.api.set(s.val(s.con(123)));
  const [view, meta] = encoder.encode(model);
  const viewDecoded = cborDecoder.decode(view);
  const decoded = decoder.decode(viewDecoded, meta);
  expect(model.view()).toEqual(decoded.view());
  expect(model.view()).toEqual(viewDecoded);
  expect(decoded.clock.sid).toBe(model.clock.sid);
  expect(decoded.clock.time).toBe(model.clock.time);
});

test('obj', () => {
  const model = Model.create();
  const encoder = new Encoder();
  const decoder = new Decoder();
  const cborDecoder = new CborDecoder();
  model.api.set({foo: null});
  const [view, meta] = encoder.encode(model);
  const viewDecoded = cborDecoder.decode(view);
  const decoded = decoder.decode(viewDecoded, meta);
  expect(model.view()).toEqual(decoded.view());
  expect(model.view()).toEqual(viewDecoded);
  expect(decoded.clock.sid).toBe(model.clock.sid);
  expect(decoded.clock.time).toBe(model.clock.time);
});

test('obj - 2', () => {
  const model = Model.create();
  const encoder = new Encoder();
  const decoder = new Decoder();
  const cborDecoder = new CborDecoder();
  model.api.set({
    a: 1,
    c: -3,
    b: 2,
  });
  const [view, meta] = encoder.encode(model);
  const viewDecoded = cborDecoder.decode(view);
  const decoded = decoder.decode(viewDecoded, meta);
  expect(model.view()).toEqual(decoded.view());
  expect(model.view()).toEqual(viewDecoded);
  expect(decoded.clock.sid).toBe(model.clock.sid);
  expect(decoded.clock.time).toBe(model.clock.time);
});

test('obj - with deleted keys', () => {
  const model = Model.create();
  const encoder = new Encoder();
  const decoder = new Decoder();
  const cborDecoder = new CborDecoder();
  model.api.set({
    a: 1,
    b: 2,
    c: 3,
    d: 4,
  });
  model.api.obj([]).del(['b', 'd']);
  expect(model.view()).toEqual({a: 1, c: 3});
  const [view, meta] = encoder.encode(model);
  const viewDecoded = cborDecoder.decode(view);
  const decoded = decoder.decode(viewDecoded, meta);
  expect(decoded.view()).toEqual({a: 1, c: 3});
});

test('obj - supports "__proto__" key', () => {
  const model = Model.create();
  const encoder = new Encoder();
  const decoder = new Decoder();
  const cborDecoder = new CborDecoder();
  model.api.set({
    a: 1,
    b: 2,
    __proto__: 3,
    d: 4,
  });
  model.api.obj([]).del(['b', 'd']);
  expect(model.view()).toEqual({a: 1, __proto__: 3});
  const [view, meta] = encoder.encode(model);
  const viewDecoded = cborDecoder.decode(view);
  const decoded = decoder.decode(viewDecoded, meta);
  expect(decoded.view()).toEqual({a: 1, __proto__: 3});
});

test('vec', () => {
  const model = Model.create();
  const encoder = new Encoder();
  const decoder = new Decoder();
  const cborDecoder = new CborDecoder();
  model.api.set(s.vec(s.con(false)));
  const [view, meta] = encoder.encode(model);
  const viewDecoded = cborDecoder.decode(view);
  const decoded = decoder.decode(viewDecoded, meta);
  expect(model.view()).toEqual(decoded.view());
  expect(model.view()).toEqual(viewDecoded);
  expect(decoded.clock.sid).toBe(model.clock.sid);
  expect(decoded.clock.time).toBe(model.clock.time);
});

test('vec - 2', () => {
  const model = Model.create();
  const encoder = new Encoder();
  const decoder = new Decoder();
  const cborDecoder = new CborDecoder();
  model.api.set(s.vec(s.con(false), s.con(1), s.con(null)));
  const [view, meta] = encoder.encode(model);
  const viewDecoded = cborDecoder.read(view);
  const decoded = decoder.decode(viewDecoded, meta);
  expect(model.view()).toEqual(decoded.view());
  expect(model.view()).toEqual(viewDecoded);
  expect(decoded.clock.sid).toBe(model.clock.sid);
  expect(decoded.clock.time).toBe(model.clock.time);
});

test('vec - with gaps', () => {
  const model = Model.create();
  const encoder = new Encoder();
  const decoder = new Decoder();
  const cborDecoder = new CborDecoder();
  model.api.set(s.vec(s.con(1)));
  model.api.vec([]).set([[2, s.con(3)]]);
  expect(model.view()).toStrictEqual([1, undefined, 3]);
  const [view, meta] = encoder.encode(model);
  const viewDecoded = cborDecoder.read(view);
  const decoded = decoder.decode(viewDecoded, meta);
  expect(decoded.view()).toStrictEqual([1, undefined, 3]);
  expect(decoded.clock.sid).toBe(model.clock.sid);
  expect(decoded.clock.time).toBe(model.clock.time);
});

test('str', () => {
  const model = Model.create();
  const encoder = new Encoder();
  const decoder = new Decoder();
  const cborDecoder = new CborDecoder();
  model.api.set('Hello');
  model.api.str([]).ins(5, ' World');
  const [view, meta] = encoder.encode(model);
  const viewDecoded = cborDecoder.read(view);
  const decoded = decoder.decode(viewDecoded, meta);
  expect(model.view()).toEqual(decoded.view());
  expect(model.view()).toEqual(viewDecoded);
  expect(decoded.clock.sid).toBe(model.clock.sid);
  expect(decoded.clock.time).toBe(model.clock.time);
});

test('str - with deleted chunks', () => {
  const model = Model.create();
  const encoder = new Encoder();
  const decoder = new Decoder();
  const cborDecoder = new CborDecoder();
  model.api.set('Hello');
  model.api.str([]).ins(5, ' World');
  const model2 = model.fork();
  model2.api.str([]).ins(3, '~');
  model.api.str([]).del(2, 2);
  const [view, meta] = encoder.encode(model);
  const viewDecoded = cborDecoder.read(view);
  const decoded = decoder.decode(viewDecoded, meta);
  decoded.applyPatch(model2.api.flush());
  expect(decoded.view()).toBe('He~o World');
});

test('bin', () => {
  const model = Model.create();
  const encoder = new Encoder();
  const decoder = new Decoder();
  const cborDecoder = new CborDecoder();
  model.api.set(new Uint8Array([1, 2, 3]));
  model.api.bin([]).ins(3, new Uint8Array([4, 5, 6]));
  const [view, meta] = encoder.encode(model);
  const viewDecoded = cborDecoder.decode(view);
  const decoded = decoder.decode(viewDecoded, meta);
  expect(model.view()).toEqual(decoded.view());
  expect(model.view()).toEqual(viewDecoded);
  expect(decoded.clock.sid).toBe(model.clock.sid);
  expect(decoded.clock.time).toBe(model.clock.time);
});

test('bin - with deleted chunks', () => {
  const model = Model.create();
  const encoder = new Encoder();
  const decoder = new Decoder();
  const cborDecoder = new CborDecoder();
  model.api.set(new Uint8Array([1, 2, 3, 4, 5]));
  const model2 = model.fork();
  model.api.bin([]).del(1, 2);
  const [view, meta] = encoder.encode(model);
  const viewDecoded = cborDecoder.read(view);
  const decoded = decoder.decode(viewDecoded, meta);
  model2.api.bin([]).ins(2, new Uint8Array([6, 7]));
  decoded.applyPatch(model2.api.flush());
  expect(decoded.view()).toEqual(new Uint8Array([1, 6, 7, 4, 5]));
});

test('arr', () => {
  const model = Model.create();
  const encoder = new Encoder();
  const decoder = new Decoder();
  const cborDecoder = new CborDecoder();
  model.api.set([1, 2, 3]);
  model.api.arr([]).ins(3, [4, 5, 6]);
  const [view, meta] = encoder.encode(model);
  const viewDecoded = cborDecoder.read(view);
  const decoded = decoder.decode(viewDecoded, meta);
  expect(model.view()).toEqual(decoded.view());
  expect(model.view()).toEqual(viewDecoded);
  expect(decoded.clock.sid).toBe(model.clock.sid);
  expect(decoded.clock.time).toBe(model.clock.time);
});

test('arr - with deleted chunks', () => {
  const model = Model.create();
  const encoder = new Encoder();
  const decoder = new Decoder();
  const cborDecoder = new CborDecoder();
  model.api.set([1, 2, 3, 4, 5]);
  const model2 = model.fork();
  model.api.arr([]).del(1, 2);
  const [view, meta] = encoder.encode(model);
  const viewDecoded = cborDecoder.read(view);
  const decoded = decoder.decode(viewDecoded, meta);
  model2.api.arr([]).ins(2, [6, 7]);
  decoded.applyPatch(model2.api.flush());
  expect(decoded.view()).toEqual([1, 6, 7, 4, 5]);
});
