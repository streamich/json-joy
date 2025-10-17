/* tslint:disable no-console */

import {Model} from '../..';
import {tick} from '../../../json-crdt-patch/clock';

const doc = Model.create();
const builder = doc.api.builder;

test('can edit document using JSON Patch operations', () => {
  // console.log(doc.view());
  // console.log(doc.toString());

  const obj = builder.obj();
  const str = builder.str();
  const insert1 = builder.insStr(str, str, 'bar');
  builder.insObj(obj, [['foo', str]]);
  builder.root(obj);
  doc.api.apply();

  // console.log(doc.view());
  // console.log(doc.toString());

  const insert2 = builder.insStr(str, tick(insert1, 2), '!');
  doc.api.apply();
  const insert3 = builder.insStr(str, insert2, ' baz!');
  doc.api.apply();

  // console.log(doc.view());
  // console.log(doc.toString());

  const _insert4 = builder.insStr(str, insert3, 'qux! ');
  doc.api.apply();

  // console.log(doc.view());
  // console.log(doc.toString());

  builder.insObj(obj, [['list', builder.json([{title: 'To the dishes!'}, {title: 'Write more tests!'}])]]);
  doc.api.apply();

  // console.log(doc.view());
  // console.log(doc.toString());

  expect(doc.view()).toStrictEqual({
    foo: 'bar! qux! baz!',
    list: [{title: 'To the dishes!'}, {title: 'Write more tests!'}],
  });
});
