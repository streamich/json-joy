import {Model} from '../../../Model';

test('handles ObjNode inside ValNode, which was set on ArrNode', () => {
  const doc = Model.withLogicalClock();
  doc.api.set([123]);
  doc.api.val('/0').set({
    foo: 'bar',
  });
  doc.api.str('/0/foo').ins(3, '!');
  expect(doc.view()).toStrictEqual([{foo: 'bar!'}]);
});
