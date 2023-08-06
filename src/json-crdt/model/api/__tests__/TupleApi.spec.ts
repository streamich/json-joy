import {Model} from '../../Model';

test('can edit a tuple', () => {
  const doc = Model.withLogicalClock();
  const api = doc.api;
  api.root(api.builder.vec());
  api.tup([]).set([[1, 'a']]);
  expect(api.tup([]).view()).toEqual([undefined, 'a']);
});
