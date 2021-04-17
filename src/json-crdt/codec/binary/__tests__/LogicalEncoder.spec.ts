import {LogicalVectorClock} from '../../../../json-crdt-patch/clock';
import {Model} from '../../../model';
import {LogicalEncoder} from '../LogicalEncoder';

test('encodes an empty document', () => {
  const doc = Model.withLogicalClock(new LogicalVectorClock(123, 0));
  const encoder = new LogicalEncoder();
  const res = encoder.encode(doc);
  expect(res).toEqual(new Uint8Array([1, 0, 0, 0, 123, 0, 0, 0, 0, 0]));
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
  expect(res).toEqual(
    new Uint8Array([1, 0, 0, 0, 123, 0, 0, 0, 4, 16, 129, 20, 17, 3, 97, 114, 114, 145, 19, 1, 18, 194]),
  );
});
