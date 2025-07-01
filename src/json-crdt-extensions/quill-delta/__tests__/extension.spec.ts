import {s} from '../../../json-crdt-patch';
import {ArrApi, StrApi, VecApi} from '../../../json-crdt/model';
import {ModelWithExt, ext} from '../../ModelWithExt';
import {Peritext} from '../../peritext';
import {QuillDeltaApi} from '../QuillDeltaApi';
import {QuillDeltaNode} from '../QuillDeltaNode';

const schema = s.obj({
  nested: s.obj({
    obj: s.obj({
      text: ext.quill.new('Hello, world\n'),
    }),
  }),
});

test('view should preserve identity', () => {
  const model = ModelWithExt.create(schema);
  expect(model.s.nested.obj.text.$.view()).toBe(model.s.nested.obj.text.$.view());
});

describe('typed access', () => {
  test('can access PeritextNode in type safe way (using the proxy selector)', () => {
    const model = ModelWithExt.create(schema);
    let api = model.s.nested.obj.text.toExt();
    expect(api).toBeInstanceOf(QuillDeltaApi);
    api = new QuillDeltaApi(api.node, api.api);
  });

  test('can access raw text "str" node in type safe way', () => {
    const model = ModelWithExt.create(schema);
    const str = model.s.nested.obj.text.toExt().text();
    expect(str).toBeInstanceOf(StrApi);
    str.ins(str.length() - 1, '!');
    expect(model.view().nested.obj.text).toEqual([{insert: 'Hello, world!\n'}]);
  });

  test('can access slices "arr" node in type safe way', () => {
    const model = ModelWithExt.create(schema);
    const arr = model.s.nested.obj.text.toExt().slices();
    expect(arr).toBeInstanceOf(ArrApi);
    expect(arr.view()).toEqual([]);
  });

  test('can access Quill Delta node using parent proxy selector', () => {
    const model = ModelWithExt.create(schema);
    const api = model.s.nested.obj.text.$;
    expect(api).toBeInstanceOf(VecApi);
    let node = api.node.ext();
    expect(node).toBeInstanceOf(QuillDeltaNode);
    node = new QuillDeltaNode(node.data);
    let api2 = api.asExt()!;
    expect(api2).toBeInstanceOf(QuillDeltaApi);
    api2 = new QuillDeltaApi(node, api.api);
  });

  test('can access Peritext context and Editor', () => {
    const model = ModelWithExt.create(schema);
    const api = model.s.nested.obj.text.toExt();
    expect(api.node.txt).toBeInstanceOf(Peritext);
  });
});
