import {Model} from '../../../';
import {LogicalEncoder} from '../LogicalEncoder';
import {LogicalDecoder} from '../LogicalDecoder';
import {LogicalVectorClock} from '../../../../json-crdt-patch/clock';

const encoder = new LogicalEncoder();
const decoder = new LogicalDecoder();

test('encoding/decoding a model results in the same node IDs', () => {
  const model1 = Model.withLogicalClock(new LogicalVectorClock(5, 0));
  model1.api.root('').commit();
  expect(model1.toView()).toStrictEqual('');
  model1.api.str([]).ins(0, 'a').commit();
  const encoded1 = encoder.encode(model1);
  const model2 = decoder.decode(encoded1);
  expect(model1.toView()).toStrictEqual('a');
  expect(model2.toView()).toStrictEqual('a');
});

test('forking and encoding/decoding results in the same node IDs', () => {
  const model1 = Model.withLogicalClock(new LogicalVectorClock(3, 0));
  model1.api.root('abc').commit();
  expect(model1.toView()).toStrictEqual('abc');
  const model2 = model1.fork(4);
  const encoded2 = encoder.encode(model2);
  const model3 = decoder.decode(encoded2);
  expect(model1.toView()).toBe('abc');
  expect(model3.toView()).toBe('abc');
  expect(model1.root.id.compare(model3.root.id)).toBe(0);
  expect(model1.api.str([]).node.id.compare(model3.api.str([]).node.id)).toBe(0);
  expect(model1.toString()).toBe(model3.toString());
});

test('vector clocks are the same after decoding', () => {
  const model1 = Model.withLogicalClock(new LogicalVectorClock(1, 0));
  model1.api.root('').commit();
  const encoded1 = encoder.encode(model1);
  const decoded1 = decoder.decode(encoded1);
  expect(model1.clock).toStrictEqual(decoded1.clock);
});

test('decoded root node ID is correct', () => {
  const model1 = Model.withLogicalClock(new LogicalVectorClock(1, 0));
  model1.api.root('').commit();
  const encoded1 = encoder.encode(model1);
  const decoded1 = decoder.decode(encoded1);
  expect(model1.root.id.isEqual(decoded1.root.id)).toBe(true);
});

test('simple string document decoded string node ID is correct', () => {
  const model1 = Model.withLogicalClock(new LogicalVectorClock(1, 0));
  model1.api.root('').commit();
  const encoded1 = encoder.encode(model1);
  const decoded1 = decoder.decode(encoded1);
  expect(model1.api.str([]).node.id.isEqual(decoded1.api.str([]).node.id)).toBe(true);
});
