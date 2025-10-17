import {Model} from '../../../Model';

test('applying old operations has no effect', () => {
  const doc = Model.create();
  doc.api.set({
    str: 'asdf',
    num: 123,
    bool: [true],
    arr: [1, 2, 3],
  });
  expect(doc.view()).toStrictEqual({
    str: 'asdf',
    num: 123,
    bool: [true],
    arr: [1, 2, 3],
  });
  const patch1 = doc.api.builder.flush();
  doc.api.str('/str').ins(1, '!!');
  doc.applyPatch(patch1);
  doc.applyPatch(patch1);
  doc.applyPatch(patch1);
  expect(doc.view()).toStrictEqual({
    str: 'a!!sdf',
    num: 123,
    bool: [true],
    arr: [1, 2, 3],
  });
  const patch2 = doc.api.flush();
  doc.applyPatch(patch2);
  doc.applyPatch(patch1);
  doc.api.obj([]).set({num: 456});
  const patch3 = doc.api.flush();
  doc.applyPatch(patch2);
  doc.applyPatch(patch1);
  doc.applyPatch(patch3);
  expect(doc.view()).toStrictEqual({
    str: 'a!!sdf',
    num: 456,
    bool: [true],
    arr: [1, 2, 3],
  });
  doc.api.val('/bool/0').set(false);
  const patch4 = doc.api.flush();
  doc.applyPatch(patch1);
  doc.applyPatch(patch4);
  doc.applyPatch(patch2);
  doc.applyPatch(patch3);
  expect(doc.view()).toStrictEqual({
    str: 'a!!sdf',
    num: 456,
    bool: [false],
    arr: [1, 2, 3],
  });
  doc.api.arr('/arr').ins(2, [['gg']]);
  doc.applyPatch(patch1);
  doc.applyPatch(patch4);
  doc.applyPatch(patch2);
  doc.applyPatch(patch3);
  expect(doc.view()).toStrictEqual({
    str: 'a!!sdf',
    num: 456,
    bool: [false],
    arr: [1, 2, ['gg'], 3],
  });
  // console.log(doc + '');
});
