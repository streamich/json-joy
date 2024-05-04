import {s} from '../../../json-crdt-patch';
import {VecApi} from '../../../json-crdt/model';
import {ModelWithExt, ext} from '../../ModelWithExt';
import {PeritextApi} from '../PeritextApi';
import {PeritextNode} from '../PeritextNode';

const schema = s.obj({
  nested: s.obj({
    obj: s.obj({
      text: ext.peritext.new('Hello, world\n'),
    }),
  }),
});

test('can access PeritextNode in type safe way', () => {
  // const model = ModelWithExt.create(schema);
  // const node = model.root.node().get('nested')!.get('obj')!.get('text')!.child!();
  // expect(node).toBeInstanceOf(PeritextNode);
  // expect(node.view()).toBe('Hello, world\n');
});

test('can access PeritextApi using path selector', () => {
  const model = ModelWithExt.create(schema);
  const api = model.api.vec(['nested', 'obj', 'text']);
  expect(api).toBeInstanceOf(VecApi);
  const api2 = api.ext();
  expect(api2).toBeInstanceOf(PeritextApi);
  model.api.str(['nested', 'obj', 'text', 1, 0]).ins(12, '!');
  expect(api.view()).toBe('Hello, world!\n');
});

test('can access PeritextApi using JSON Pointer path selector', () => {
  const model = ModelWithExt.create(schema);
  const api = model.api.vec('/nested/obj/text');
  expect(api).toBeInstanceOf(VecApi);
  const api2 = api.ext();
  expect(api2).toBeInstanceOf(PeritextApi);
  model.api.str('/nested/obj/text/1/0').ins(12, '!');
  expect(api.view()).toBe('Hello, world!\n');
});

test('can access PeritextApi using step-wise selector', () => {
  const model = ModelWithExt.create(schema);
  const api = model.api.in('nested').in('obj').in('text').asTup();
  expect(api).toBeInstanceOf(VecApi);
  const api2 = api.ext();
  expect(api2).toBeInstanceOf(PeritextApi);
  model.api.in('nested').in('obj').in('text').in(1).in(0).asStr().ins(12, '!');
  model.api.in('/nested/obj/text/1/0').asStr().ins(12, '!');
  model.api.in(['nested', 'obj', 'text', 1, 0]).asStr().ins(12, '!');
  expect(api.view()).toBe('Hello, world!!!\n');
});

test('can access PeritextApi using parent proxy selector', () => {
  const model = ModelWithExt.create(schema);
  const api = model.s.nested.obj.text.toApi();
  expect(api).toBeInstanceOf(VecApi);
  let node = api.node.ext();
  expect(node).toBeInstanceOf(PeritextNode);
  node = new PeritextNode(node.data);
  let api2 = api.ext()!;
  expect(api2).toBeInstanceOf(PeritextApi);
  api2 = new PeritextApi(node, api.api);
});

test('can access PeritextApi using inline proxy selector', () => {
  const model = ModelWithExt.create(schema);
  let api = model.s.nested.obj.text.ext();
  expect(api).toBeInstanceOf(PeritextApi);
  api = new PeritextApi(api.node, api.api);
});

// test('can access nested nodes using proxy selector', () => {
//   const model = ModelWithExt.create(schema);
//   const api = model.s.nested.obj.text.toApi();
//   console.log(api + '');
// });
