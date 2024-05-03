import {s} from '../../../json-crdt-patch';
import {ModelWithExt, ext} from '../../ModelWithExt';
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

test('can access PeritextApi using proxy selector', () => {
  const model = ModelWithExt.create(schema);
  model.api.str(['nested', 'obj', 'text', 1, 0]).ins(12, '!');
  const api = model.s.nested.obj.text.toApi();
  expect(api.view()).toBe('Hello, world!\n');
});

test.todo('can access nested nodes using proxy selector');
