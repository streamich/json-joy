import {Model} from '../../../model';
import {Encoder} from '../Encoder';

test('encodes repeating object keys into literals table', () => {
  const encoder = new Encoder();
  const model1 = Model.withLogicalClock();
  model1.api.root({
    foo: {
      bar: 0,
    }
  }).commit();
  const model2 = Model.withLogicalClock();
  model2.api.root({
    foo: {
      foo: 0,
    }
  }).commit();
  const encoded1 = encoder.encode(model1);
  const encoded2 = encoder.encode(model2);
  expect(encoded1.byteLength > encoded2.byteLength).toBe(true);
});
