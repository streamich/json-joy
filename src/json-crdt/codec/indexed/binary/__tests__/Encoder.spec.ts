import {Model} from '../../../../model';
import {Encoder} from '../Encoder';

test('encodes model', () => {
  const encoder = new Encoder();
  const doc = Model.withLogicalClock();
  doc.api.set([123, true, {a: 1, b: 2, c: 'foo'}, {hmm: new Uint8Array([1, 2, 3])}]);
  const result = encoder.encode(doc);
  // console.log(doc.view());
  // console.log(doc + '');
  // console.log(result);
  // console.log(result.clock);
  // console.log(result.root);
  // console.log(result.index);
  expect(result.c).toBeInstanceOf(Uint8Array);
  expect(result.r).toBeInstanceOf(Uint8Array);
  expect(result['0_1']).toBeInstanceOf(Uint8Array);
});
