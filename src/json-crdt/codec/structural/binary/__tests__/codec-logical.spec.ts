import {Model} from '../../../../';
import {Encoder} from '../Encoder';
import {Decoder} from '../Decoder';
import {compare, equal, Timestamp, ClockVector} from '../../../../../json-crdt-patch/clock';
import {s} from '../../../../../json-crdt-patch';

const encoder = new Encoder();
const decoder = new Decoder();

test('empty model', () => {
  const model1 = Model.create(void 0, new ClockVector(5, 0));
  const encoded1 = encoder.encode(model1);
  const model2 = decoder.decode(encoded1);
  expect(model1.view()).toBe(undefined);
  expect(model2.view()).toBe(undefined);
  expect(model2.clock.sid).toBe(model1.clock.sid);
  expect(model2.clock.time).toBe(model1.clock.time);
  expect(model2.clock).toStrictEqual(model1.clock);
});

test('model with just a single number', () => {
  const model1 = Model.create(void 0, new ClockVector(5, 0));
  model1.api.set(123);
  const encoded1 = encoder.encode(model1);
  const model2 = decoder.decode(encoded1);
  expect(model1.view()).toBe(123);
  expect(model2.view()).toBe(123);
  expect(model2.clock.sid).toBe(model1.clock.sid);
  expect(model2.clock.time).toBe(model1.clock.time);
  expect(model2.clock).toStrictEqual(model1.clock);
});

test('model with just a single string', () => {
  const model1 = Model.create(void 0, new ClockVector(5, 0));
  model1.api.set('aaaa');
  const encoded1 = encoder.encode(model1);
  const model2 = decoder.decode(encoded1);
  expect(model1.view()).toBe('aaaa');
  expect(model2.view()).toBe('aaaa');
  expect(model2.clock.sid).toBe(model1.clock.sid);
  expect(model2.clock.time).toBe(model1.clock.time);
  expect(model2.clock).toStrictEqual(model1.clock);
});

test('model with a simple object', () => {
  const model1 = Model.create(void 0, new ClockVector(5, 0));
  model1.api.set({foo: 123});
  const encoded1 = encoder.encode(model1);
  const model2 = decoder.decode(encoded1);
  expect(model1.view()).toStrictEqual({foo: 123});
  expect(model2.view()).toStrictEqual({foo: 123});
  expect(model2.clock.sid).toBe(model1.clock.sid);
  expect(model2.clock.time).toBe(model1.clock.time);
  expect(model2.clock).toStrictEqual(model1.clock);
});

test('encoding/decoding a model results in the same node IDs', () => {
  const model1 = Model.create(void 0, new ClockVector(5, 0));
  model1.api.set('');
  expect(model1.view()).toStrictEqual('');
  model1.api.str([]).ins(0, 'a');
  const encoded1 = encoder.encode(model1);
  const model2 = decoder.decode(encoded1);
  expect(model1.view()).toStrictEqual('a');
  expect(model2.view()).toStrictEqual('a');
  expect(model2.clock.sid).toBe(model1.clock.sid);
  expect(model2.clock.time).toBe(model1.clock.time);
  expect(model2.clock).toStrictEqual(model1.clock);
});

test('forking and encoding/decoding results in the same node IDs', () => {
  const model1 = Model.create(void 0, new ClockVector(3, 0));
  model1.api.set('abc');
  expect(model1.view()).toStrictEqual('abc');
  const model2 = model1.fork(4);
  const encoded2 = encoder.encode(model2);
  const model3 = decoder.decode(encoded2);
  expect(model1.view()).toBe('abc');
  expect(model3.view()).toBe('abc');
  expect(compare(model1.root.id, model3.root.id)).toBe(0);
  expect(compare(model1.api.str([]).node.id, model3.api.str([]).node.id)).toBe(0);
});

test('vector clocks are the same after decoding', () => {
  const model1 = Model.create(void 0, new ClockVector(555555, 0));
  model1.api.set('');
  const encoded1 = encoder.encode(model1);
  const decoded1 = decoder.decode(encoded1);
  expect(model1.clock).toStrictEqual(decoded1.clock);
});

test('decoded root node ID is correct', () => {
  const model1 = Model.create(void 0, new ClockVector(666666, 0));
  model1.api.set('');
  const encoded1 = encoder.encode(model1);
  const decoded1 = decoder.decode(encoded1);
  expect(equal(model1.root.id, decoded1.root.id)).toBe(true);
});

test('simple string document decoded string node ID is correct', () => {
  const model1 = Model.create(void 0, new ClockVector(777777, 0));
  model1.api.set('');
  const encoded1 = encoder.encode(model1);
  const decoded1 = decoder.decode(encoded1);
  expect(equal(model1.api.str([]).node.id, decoded1.api.str([]).node.id)).toBe(true);
});

test('can encode ID as const value', () => {
  const model = Model.create();
  model.api.set({
    foo: s.con(new Timestamp(model.clock.sid, 2)),
  });
  const encoded = encoder.encode(model);
  const decoded = decoder.decode(encoded);
  const view = decoded.view();
  const ts = (view as any).foo as Timestamp;
  expect(ts).toBeInstanceOf(Timestamp);
  expect(equal(ts, new Timestamp(model.clock.sid, 2))).toBe(true);
});

test('can encode timestamp in "con" node', () => {
  const model = Model.create();
  model.api.set(s.con(new Timestamp(666, 1)));
  const encoded = encoder.encode(model);
  const decoded = decoder.decode(encoded);
  expect(model.view()).toEqual(decoded.view());
  expect(decoded.clock.sid).toBe(model.clock.sid);
  expect(decoded.clock.time).toBe(model.clock.time);
});
