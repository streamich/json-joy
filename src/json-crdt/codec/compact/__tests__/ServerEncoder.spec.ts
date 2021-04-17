import {Model} from '../../../model';
import {ServerEncoder} from '../ServerEncoder';

test('encodes an empty document', () => {
  const doc = Model.withServerClock();
  const encoder = new ServerEncoder();
  const res = encoder.encode(doc);
  expect(res).toEqual([0, 0, 0]);
});

test('can encode object and array', () => {
  const doc = Model.withServerClock();
  const encoder = new ServerEncoder();
  doc.api
    .root({
      arr: [false],
    })
    .commit();
  const res = encoder.encode(doc);
  expect(res).toEqual([5, 1, [0, 5, 'arr', 2, [1, 4, 3, [2]]]]);
});
