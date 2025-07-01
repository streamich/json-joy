import {Model} from '../../../../';
import {Encoder} from '../Encoder';
import {Decoder} from '../Decoder';
import {compare, ClockVector} from '../../../../../json-crdt-patch/clock';

const encoder = new Encoder();
const decoder = new Decoder();

test('encoding/decoding a model results in the same node IDs', () => {
  const model1 = Model.create(void 0, new ClockVector(5, 0));
  model1.api.set('');
  expect(model1.view()).toStrictEqual('');
  model1.api.str([]).ins(0, 'a');
  const encoded1 = encoder.encode(model1);
  const model2 = decoder.decode(encoded1);
  expect(model1.view()).toStrictEqual('a');
  expect(model2.view()).toStrictEqual('a');
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
