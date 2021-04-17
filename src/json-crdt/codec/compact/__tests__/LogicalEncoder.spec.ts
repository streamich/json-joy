import {LogicalVectorClock} from '../../../../json-crdt-patch/clock';
import {Model} from '../../../model';
import {LogicalEncoder} from '../LogicalEncoder';

test('encodes an empty document', () => {
  const doc = Model.withLogicalClock(new LogicalVectorClock(123, 0));
  const encoder = new LogicalEncoder();
  const res = encoder.encode(doc);
  expect(res).toEqual([[123, 0], 0, 0, 0]);
});

test('can encode object and array', () => {
  const doc = Model.withLogicalClock(new LogicalVectorClock(123, 0));
  const encoder = new LogicalEncoder();
  doc.api
    .root({
      arr: [false],
    })
    .commit();
  const res = encoder.encode(doc);
  expect(res).toEqual([[123, 4], 1, 0, [0, 1, 4, 'arr', 1, 1, [1, 1, 3, 1, 2, [2]]]]);
});
