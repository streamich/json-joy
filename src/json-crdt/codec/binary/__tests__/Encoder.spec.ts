import {VectorClock} from '../../../../json-crdt-patch/clock';
import {Document} from '../../../document';
import {Encoder} from '../Encoder';

test('encodes an empty document', () => {
  const doc = new Document(new VectorClock(123, 0));
  const encoder = new Encoder();
  const res = encoder.encode(doc);
  expect(res).toEqual(new Uint8Array([1, 0, 0, 0, 123, 0, 0, 0, 0, 0]));
});

test('can encode object and array', () => {
  const doc = new Document(new VectorClock(123, 0));
  const encoder = new Encoder();
  doc.api
    .root({
      arr: [false],
    })
    .commit();
  const res = encoder.encode(doc);
  expect(res).toEqual(new Uint8Array([1, 0, 0, 0, 123, 0, 0, 0, 5, 17, 129,  21, 18, 3, 145, 20, 1, 19, 194]));
});

test('can encode all data types', () => {
  const doc = new Document(new VectorClock(123, 0));
  const encoder = new Encoder();
  doc.api
    .root({
      arr: [false, null, true, 123, 1.2, 'hello', {foo: 'bar'}],
    })
    .commit();
  const res = encoder.encode(doc);
  expect(res).toEqual(new Uint8Array([
      1,   0,   0,   0, 123,   0,   0,   0,  25,  17, 129,
    129,  25,  18,   3, 145, 129,  24,   7,  25, 194, 192,
    195, 213, 129,  23, 129,  23, 123, 213, 129,  22, 129,
    22, 203,  63, 243,  51,  51,  51,  51,  51,  51, 161,
    129,  21,   5, 129,  20, 129,  31,  26,   3, 161,  30,
      3,  29
  ]));
});
