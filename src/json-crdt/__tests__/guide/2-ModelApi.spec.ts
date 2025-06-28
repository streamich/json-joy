/* tslint:disable no-console */

import {Model} from '../..';

const doc = Model.withLogicalClock();

test('can edit document using JSON Patch operations', () => {
  // console.log(doc.view());
  // console.log(doc.toString());

  doc.api.set({foo: 'bar'});

  // console.log(doc.view());
  // console.log(doc.toString());

  doc.api.str('/foo').ins(3, '!');
  doc.api.str(['foo']).ins(4, ' baz!');

  // console.log(doc.view());
  // console.log(doc.toString());

  doc.api.str('/foo').ins(5, 'qux! ');

  // console.log(doc.view());
  // console.log(doc.toString());

  doc.api.obj('').set({
    list: [{title: 'To the dishes!'}, {title: 'Write more tests!'}],
  });

  // console.log(doc.view());
  // console.log(doc.toString());

  expect(doc.view()).toStrictEqual({
    foo: 'bar! qux! baz!',
    list: [{title: 'To the dishes!'}, {title: 'Write more tests!'}],
  });
});
