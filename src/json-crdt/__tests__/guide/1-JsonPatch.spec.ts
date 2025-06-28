/* tslint:disable no-console */

import {Model} from '../..';
import {JsonPatch} from '../../json-patch';

const doc = Model.create();
const jsonPatch = new JsonPatch(doc);

test('can edit document using JSON Patch operations', () => {
  // console.log(doc.view());
  // console.log(doc.toString());

  jsonPatch.apply([{op: 'add', path: '', value: {foo: 'bar'}}]);

  // console.log(doc.view());
  // console.log(doc.toString());

  jsonPatch.apply([{op: 'str_ins', path: '/foo', pos: 3, str: '!'}]);

  jsonPatch.apply([{op: 'str_ins', path: '/foo', pos: 4, str: ' baz!'}]);

  // console.log(doc.view());
  // console.log(doc.toString());

  jsonPatch.apply([{op: 'str_ins', path: '/foo', pos: 5, str: 'qux! '}]);

  // console.log(doc.view());
  // console.log(doc.toString());

  jsonPatch.apply([{op: 'add', path: '/list', value: [{title: 'To the dishes!'}, {title: 'Write more tests!'}]}]);

  // console.log(doc.view());
  // console.log(doc.toString());

  expect(doc.view()).toStrictEqual({
    foo: 'bar! qux! baz!',
    list: [{title: 'To the dishes!'}, {title: 'Write more tests!'}],
  });
});
