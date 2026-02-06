import {Model} from '../../../../model';
import {Encoder} from '../Encoder';
import {Decoder} from '../Decoder';
import {assertParents} from '../../../../model/__tests__/util';

test('can deserialize a model', () => {
  const encoder = new Encoder();
  const doc = Model.create();
  doc.api.set({a: 123, b: 'c', c: new Uint8Array([1, 2]), arr: [1], z: {}});
  const result = encoder.encode(doc);
  const decoder = new Decoder();
  const doc2 = decoder.decode(result);
  expect(doc2.view()).toStrictEqual(doc.view());
  expect(doc2.clock.sid).toStrictEqual(doc.clock.sid);
  expect(doc2.clock.time).toStrictEqual(doc.clock.time);
  expect(doc2.root.val.sid).toStrictEqual(doc.root.val.sid);
  expect(doc2.root.val.time).toStrictEqual(doc.root.val.time);
  assertParents(doc);
  assertParents(doc2);
});
