import {s} from '../../../../../json-crdt-patch';
import {CborDecoder} from '../../../../../json-pack/cbor/CborDecoder';
import {Model} from '../../../../model';
import {Encoder} from '../Encoder';
import {Decoder} from '../Decoder';

test('con', () => {
  const model = Model.withLogicalClock();
  const encoder = new Encoder();
  const decoder = new Decoder();
  const cborDecoder = new CborDecoder();
  model.api.root(s.con(123));
  const [view, meta] = encoder.encode(model);
  const viewDecoded = cborDecoder.decode(view);
  const decoded = decoder.decode(viewDecoded, meta);
  expect(model.view()).toEqual(decoded.view());
  expect(model.view()).toEqual(viewDecoded);
  expect(decoded.clock.sid).toBe(model.clock.sid);
  expect(decoded.clock.time).toBe(model.clock.time);
});

test('val', () => {
  const model = Model.withLogicalClock();
  const encoder = new Encoder();
  const decoder = new Decoder();
  const cborDecoder = new CborDecoder();
  model.api.root(s.val(s.con(123)));
  const [view, meta] = encoder.encode(model);
  const viewDecoded = cborDecoder.decode(view);
  const decoded = decoder.decode(viewDecoded, meta);
  expect(model.view()).toEqual(decoded.view());
  expect(model.view()).toEqual(viewDecoded);
  expect(decoded.clock.sid).toBe(model.clock.sid);
  expect(decoded.clock.time).toBe(model.clock.time);
});

test('obj', () => {
  const model = Model.withLogicalClock();
  const encoder = new Encoder();
  const decoder = new Decoder();
  const cborDecoder = new CborDecoder();
  model.api.root({foo: null});
  const [view, meta] = encoder.encode(model);
  const viewDecoded = cborDecoder.decode(view);
  const decoded = decoder.decode(viewDecoded, meta);
  expect(model.view()).toEqual(decoded.view());
  expect(model.view()).toEqual(viewDecoded);
  expect(decoded.clock.sid).toBe(model.clock.sid);
  expect(decoded.clock.time).toBe(model.clock.time);
});

test('obj - 2', () => {
  const model = Model.withLogicalClock();
  const encoder = new Encoder();
  const decoder = new Decoder();
  const cborDecoder = new CborDecoder();
  model.api.root({
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

test('vec', () => {
  const model = Model.withLogicalClock();
  const encoder = new Encoder();
  const decoder = new Decoder();
  const cborDecoder = new CborDecoder();
  model.api.root(s.vec(s.con(false)));
  const [view, meta] = encoder.encode(model);
  const viewDecoded = cborDecoder.decode(view);
  const decoded = decoder.decode(viewDecoded, meta);
  expect(model.view()).toEqual(decoded.view());
  expect(model.view()).toEqual(viewDecoded);
  expect(decoded.clock.sid).toBe(model.clock.sid);
  expect(decoded.clock.time).toBe(model.clock.time);
});

test('vec - 2', () => {
  const model = Model.withLogicalClock();
  const encoder = new Encoder();
  const decoder = new Decoder();
  const cborDecoder = new CborDecoder();
  model.api.root(
    s.vec(
      s.con(false),
      s.con(1),
      s.con(null),
    )
  );
  const [view, meta] = encoder.encode(model);
  const viewDecoded = cborDecoder.decode(view);
  const decoded = decoder.decode(viewDecoded, meta);
  expect(model.view()).toEqual(decoded.view());
  expect(model.view()).toEqual(viewDecoded);
  expect(decoded.clock.sid).toBe(model.clock.sid);
  expect(decoded.clock.time).toBe(model.clock.time);
});

test('str', () => {
  const model = Model.withLogicalClock();
  const encoder = new Encoder();
  const decoder = new Decoder();
  const cborDecoder = new CborDecoder();
  model.api.root('Hello');
  model.api.str([]).ins(5, ' World');
  const [view, meta] = encoder.encode(model);
  const viewDecoded = cborDecoder.decode(view);
  const decoded = decoder.decode(viewDecoded, meta);
  expect(model.view()).toEqual(decoded.view());
  expect(model.view()).toEqual(viewDecoded);
  expect(decoded.clock.sid).toBe(model.clock.sid);
  expect(decoded.clock.time).toBe(model.clock.time);
});

test('bin', () => {
  const model = Model.withLogicalClock();
  const encoder = new Encoder();
  const decoder = new Decoder();
  const cborDecoder = new CborDecoder();
  model.api.root(new Uint8Array([1, 2, 3]));
  model.api.bin([]).ins(3, new Uint8Array([4, 5, 6]));
  const [view, meta] = encoder.encode(model);
  const viewDecoded = cborDecoder.decode(view);
  const decoded = decoder.decode(viewDecoded, meta);
  expect(model.view()).toEqual(decoded.view());
  expect(model.view()).toEqual(viewDecoded);
  expect(decoded.clock.sid).toBe(model.clock.sid);
  expect(decoded.clock.time).toBe(model.clock.time);
});

