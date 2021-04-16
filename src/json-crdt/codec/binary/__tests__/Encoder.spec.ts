import {LogicalVectorClock} from '../../../../json-crdt-patch/clock';
import {Model} from '../../../model';
import {Encoder} from '../Encoder';

test('encodes an empty document', () => {
  const doc = new Model(new LogicalVectorClock(123, 0));
  const encoder = new Encoder();
  const res = encoder.encode(doc);
  expect(res).toEqual(new Uint8Array([1, 0, 0, 0, 123, 0, 0, 0, 0, 0]));
});

test('can encode object and array', () => {
  const doc = new Model(new LogicalVectorClock(123, 0));
  const encoder = new Encoder();
  doc.api
    .root({
      arr: [false],
    })
    .commit();
  const res = encoder.encode(doc);
  expect(res).toEqual(
    new Uint8Array([1, 0, 0, 0, 123, 0, 0, 0, 5, 17, 129, 21, 18, 3, 97, 114, 114, 145, 20, 1, 19, 194]),
  );
});
