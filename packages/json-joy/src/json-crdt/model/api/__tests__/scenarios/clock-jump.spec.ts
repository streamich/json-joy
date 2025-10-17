import {Model} from '../../../Model';

test('advances local clock if remote operations arrived', () => {
  const doc = Model.create();
  doc.api.set('123');
  const doc2 = doc.fork();
  doc2.api.str('').ins(3, '456');
  const patch = doc2.api.flush();
  doc.applyPatch(patch);
  doc.api.str('').ins(3, '!');
  const patch2 = doc.api.flush();
  const lastOperation = patch2.ops[patch2.ops.length - 1];
  expect(lastOperation.id.time > patch.getId()!.time).toBe(true);
});
