import {mval} from '../../mval';
import {quill} from '..';
import {Model} from '../../../json-crdt/model';
import Delta from 'quill-delta';
import type {QuillDeltaPatch} from '../types';

test('can construct delta with new line character', () => {
  const model = Model.create();
  model.ext.register(mval);
  model.ext.register(quill);
  model.api.root(quill.new('\n'));
  expect(model.view()).toMatchObject([{insert: '\n'}]);
});

test('creates a string-set 2-tuple', () => {
  const model = Model.create();
  model.ext.register(mval);
  model.ext.register(quill);
  model.api.root(quill.new(''));
  model.api.apply();
  const api = model.api.in().asExt(quill);
  api.apply([{insert: 'a'}]);
  api.apply([{retain: 1}, {insert: 'b'}]);
  api.apply([{retain: 2}, {insert: 'c'}]);
  const model2 = Model.fromBinary(model.toBinary());
  expect(model2.view()).toMatchObject([expect.any(Uint8Array), ['abc', [], {}]]);
});

test('can annotate range with attribute', () => {
  const model = Model.create();
  model.ext.register(mval);
  model.ext.register(quill);
  model.api.root({
    foo: 'bar',
    richText: quill.new('Hello world!'),
  });
  const api = model.api.in(['richText']).asExt(quill);
  api.apply([
    {retain: 6},
    {
      retain: 5,
      attributes: {
        bold: true,
      },
    },
  ]);
  expect(model.view()).toEqual({
    foo: 'bar',
    richText: [{insert: 'Hello '}, {insert: 'world', attributes: {bold: true}}, {insert: '!'}],
  });
});

test('inserting in the middle of annotated text does not create new slice', () => {
  const model = Model.create();
  model.ext.register(quill);
  model.api.root(quill.new(''));
  const api = model.api.in().asExt(quill);
  api.apply([{insert: 'ac', attributes: {bold: true}}]);
  api.node.txt.overlay.refresh();
  expect(api.node.txt.savedSlices.size()).toBe(1);
  api.apply([{retain: 1}, {insert: 'b', attributes: {bold: true}}]);
  api.node.txt.overlay.refresh();
  expect(api.node.txt.savedSlices.size()).toBe(1);
});

test('inserting in the middle of annotated text does not create new slice - 2', () => {
  const model = Model.create();
  model.ext.register(quill);
  model.api.root(quill.new(''));
  const api = model.api.in().asExt(quill);
  api.apply([{insert: '\n'}]);
  api.apply([{insert: 'aaa'}]);
  api.apply([{retain: 1}, {retain: 2, attributes: {bold: true}}]);
  expect(api.node.txt.savedSlices.size()).toBe(1);
  api.apply([{retain: 2}, {insert: 'a', attributes: {bold: true}}]);
  api.apply([{retain: 3}, {insert: 'a', attributes: {bold: true}}]);
  expect(api.node.txt.savedSlices.size()).toBe(1);
  api.node.txt.overlay.refresh();
});

test('can insert text in an annotated range', () => {
  const model = Model.create();
  model.ext.register(quill);
  model.api.root(quill.new('\n'));
  const api = model.api.in().asExt(quill);
  api.apply([{insert: 'abc xyz'}]);
  api.apply([{retain: 4}, {retain: 3, attributes: {bold: true}}]);
  api.apply([{retain: 3}, {insert: 'def'}]);
  api.apply([{retain: 8}, {insert: '1', attributes: {bold: true}}]);
  expect(api.view()).toEqual([{insert: 'abcdef '}, {insert: 'x1yz', attributes: {bold: true}}, {insert: '\n'}]);
  expect(model.view()).toEqual(api.view());
});

test('can insert italic-only text in bold text', () => {
  const model = Model.create();
  model.ext.register(quill);
  model.api.root(quill.new(''));
  const api = model.api.in().asExt(quill);
  api.apply([{insert: 'aa', attributes: {bold: true}}]);
  api.apply([{retain: 1}, {insert: 'b', attributes: {italic: true}}]);
  let delta = new Delta([{insert: 'aa', attributes: {bold: true}}]);
  delta = delta.compose(new Delta([{retain: 1}, {insert: 'b', attributes: {italic: true}}]));
  expect(api.view()).toEqual([
    {insert: 'a', attributes: {bold: true}},
    {insert: 'b', attributes: {italic: true}},
    {insert: 'a', attributes: {bold: true}},
  ]);
  expect(model.view()).toEqual(api.view());
  expect(model.view()).toEqual(delta.ops);
});

test('can remove a bold text annotation', () => {
  const model = Model.create();
  model.ext.register(quill);
  model.api.root(quill.new(''));
  const api = model.api.in().asExt(quill);
  let delta = new Delta([]);
  const apply = (ops: QuillDeltaPatch['ops']) => {
    api.apply(ops);
    delta = delta.compose(new Delta(ops));
  };
  apply([{insert: 'ab'}]);
  apply([{retain: 1}, {insert: '\n', attributes: {bold: true}}]);
  apply([{retain: 1}, {retain: 1, attributes: {bold: null}}]);
  expect(model.view()).toEqual(api.view());
  expect(model.view()).toEqual(delta.ops);
});
