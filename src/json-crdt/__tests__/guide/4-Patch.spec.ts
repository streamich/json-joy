/* tslint:disable no-console */

import {Model} from '../..';
import {tick} from '../../../json-crdt-patch/clock';
import {ORIGIN} from '../../../json-crdt-patch/constants';
import {NewStrOp, InsValOp, NewObjOp, InsObjOp, InsStrOp} from '../../../json-crdt-patch/operations';
import {Patch} from '../../../json-crdt-patch/Patch';
import {PatchBuilder} from '../../../json-crdt-patch/PatchBuilder';

const doc = Model.create();
const clock = doc.clock;
const patch = new Patch();

test('can edit document using JSON Patch operations', () => {
  // console.log(doc.view());
  // console.log(doc.toString());

  const obj = clock.tick(1);
  patch.ops.push(new NewObjOp(obj));

  const str = clock.tick(1);
  patch.ops.push(new NewStrOp(str));

  const insert1 = clock.tick(3);
  patch.ops.push(new InsStrOp(insert1, str, str, 'bar'));

  const keys = clock.tick(1);
  patch.ops.push(new InsObjOp(keys, obj, [['foo', str]]));

  const root = clock.tick(1);
  patch.ops.push(new InsValOp(root, ORIGIN, obj));

  doc.applyPatch(patch);

  // console.log(doc.view());
  // console.log(doc.toString());

  const insert2 = clock.tick(1);
  patch.ops.push(new InsStrOp(insert2, str, tick(insert1, 2), '!'));

  const insert3 = clock.tick(5);
  patch.ops.push(new InsStrOp(insert3, str, insert2, ' baz!'));

  doc.applyPatch(patch);

  // console.log(doc.view());
  // console.log(doc.toString());

  const insert4 = clock.tick(5);
  patch.ops.push(new InsStrOp(insert4, str, insert3, 'qux! '));

  doc.applyPatch(patch);

  // console.log(doc.view());
  // console.log(doc.toString());

  const builder = new PatchBuilder(clock);
  const list = builder.json([{title: 'To the dishes!'}, {title: 'Write more tests!'}]);
  patch.ops.push(...builder.patch.ops);

  const setKeys = clock.tick(1);
  patch.ops.push(new InsObjOp(setKeys, obj, [['list', list]]));

  doc.applyPatch(patch);

  // console.log(doc.view());
  // console.log(doc.toString());

  expect(doc.view()).toStrictEqual({
    foo: 'bar! qux! baz!',
    list: [{title: 'To the dishes!'}, {title: 'Write more tests!'}],
  });
});
