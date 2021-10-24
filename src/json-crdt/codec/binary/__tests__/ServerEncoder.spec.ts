import {LogicalVectorClock} from '../../../../json-crdt-patch/clock';
import {Model} from '../../../model';
import {ServerEncoder} from '../ServerEncoder';

test('encodes an empty document', () => {
  const doc = Model.withLogicalClock(new LogicalVectorClock(123, 0));
  const encoder = new ServerEncoder();
  const res = encoder.encode(doc);
  expect(res).toEqual(new Uint8Array([0, 0]));
});

test('can encode object and array', () => {
  const doc = Model.withLogicalClock(new LogicalVectorClock(123, 0));
  const encoder = new ServerEncoder();
  doc.api
    .root({
      arr: [false],
    })
    .commit();
  const res = encoder.encode(doc);
  expect(res).toEqual(new Uint8Array([5, 1, 129, 5, 2, 3, 97, 114, 114, 145, 4, 1, 3, 194]));
});
