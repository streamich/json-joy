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
  const model = ModelWithExt.create(schema);
  const node = model.root.node().get('nested')!.get('obj')!.get('text')!.child!();
  expect(node).toBeInstanceOf(PeritextNode);
  expect(node.view()).toBe('Hello, world\n');
});

test.only('can access PeritextApi using path selector', () => {
  const model = ModelWithExt.create(schema);
  const api = model.api.vec(['nested', 'obj', 'text']);
  expect(api).toBeInstanceOf(VecApi);
  const api2 = api.ext();
  expect(api2).toBeInstanceOf(PeritextApi);
  model.api.str(['nested', 'obj', 'text', 1, 0]).ins(12, '!');
  expect(api.view()).toBe('Hello, world!\n');
});

// test.only('can access PeritextApi using proxy selector', () => {
  // const api = model.s.nested.obj.text.toApi();
// });

// test('can access nested nodes using proxy selector', () => {
//   const model = ModelWithExt.create(schema);
//   const api = model.s.nested.obj.text.toApi();
//   console.log(api + '');
// });
