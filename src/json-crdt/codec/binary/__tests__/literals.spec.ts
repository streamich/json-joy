import {Model} from '../../../model';
import {Encoder} from '../Encoder';

test('encodes repeating object keys into literals table', () => {
  const encoder = new Encoder();
  const model1 = Model.withLogicalClock();
  model1.api
    .root({
      foooo: {
        baaar: 0,
      },
    })
    .commit();
  const model2 = Model.withLogicalClock();
  model2.api
    .root({
      foooo: {
        foooo: 0,
      },
    })
    .commit();
  const encoded1 = encoder.encode(model1);
  const encoded2 = encoder.encode(model2);
  expect(encoded1.byteLength > encoded2.byteLength).toBe(true);
});

test('encodes repeating string chunks into literals table', () => {
  const encoder = new Encoder();
  const model1 = Model.withLogicalClock();
  model1.api.root(['fooooo', 'baaaar']).commit();
  const model2 = Model.withLogicalClock();
  model2.api.root(['fooooo', 'fooooo']).commit();
  const encoded1 = encoder.encode(model1);
  const encoded2 = encoder.encode(model2);
  expect(encoded1.byteLength > encoded2.byteLength).toBe(true);
});

test('encodes repeating numbers into literals table', () => {
  const encoder = new Encoder();
  const model1 = Model.withLogicalClock();
  model1.api.root([11111111111, 22222222222]).commit();
  const model2 = Model.withLogicalClock();
  model2.api.root([11111111111, 11111111111]).commit();
  const encoded1 = encoder.encode(model1);
  const encoded2 = encoder.encode(model2);
  expect(encoded1.byteLength > encoded2.byteLength).toBe(true);
});
