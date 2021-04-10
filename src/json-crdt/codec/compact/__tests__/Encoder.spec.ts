import {VectorClock} from '../../../../json-crdt-patch/clock';
import {Document} from '../../../document';
import {Encoder} from '../Encoder';

test('encodes an empty document', () => {
  const doc = new Document(new VectorClock(123, 0));
  const encoder = new Encoder();
  const res = encoder.encode(doc);
  expect(res).toEqual([ [ 123, 0 ], 0, 0, 0 ]);
});

test('can encode object and array', () => {
  const doc = new Document(new VectorClock(123, 0));
  const encoder = new Encoder();
  doc.api.root({
    arr: [false],
  }).commit();
  const res = encoder.encode(doc);
  expect(res).toEqual([
    [
        123,
        5
    ],
    1,
    1,
    [
        0,
        1,
        5,
        "arr",
        1,
        2,
        [
            1,
            1,
            4,
            1,
            3,
            2
        ]
    ]
  ]);
});