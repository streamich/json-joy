import {Model} from '../../../';
import {LogicalEncoder} from '../LogicalEncoder';
import {LogicalDecoder} from '../LogicalDecoder';
import {LogicalVectorClock} from '../../../../json-crdt-patch/clock';

const encoder = new LogicalEncoder();
const decoder = new LogicalDecoder();

test('users edit concurrently a JSON block', () => {
  const model1 = Model.withLogicalClock(new LogicalVectorClock(5, 0));
  model1.api.root('').commit();
  expect(model1.toView()).toStrictEqual('');
  model1.api.str([])
    .ins(0, 'a')
    .commit();
  const encoded1 = encoder.encode(model1);
  // console.log(encoded1);
  const model2 = decoder.decode(encoded1);
  // console.log(model1.toString());
  // console.log(model2.toString());
  expect(model1.toView()).toStrictEqual('a');
  expect(model2.toView()).toStrictEqual('a');
  const encoded2 = encoder.encode(model2);
  // console.log(encoded2);
  expect(encoded1).toStrictEqual(encoded2);
});
