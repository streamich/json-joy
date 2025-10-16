import {s} from '../../../json-crdt-patch';
import {ArrApi, StrApi, VecApi} from '../../../json-crdt/model';
import {ModelWithExt, ext} from '../../ModelWithExt';
import {Peritext} from '../Peritext';
import {PeritextApi} from '../PeritextApi';
import {PeritextNode} from '../PeritextNode';
import {Editor} from '../editor/Editor';

const schema = s.obj({
  nested: s.obj({
    obj: s.obj({
      text: ext.peritext.new('Hello, world\n'),
    }),
  }),
});

test('view should preserve identity', () => {
  const model = ModelWithExt.create(schema);
  expect(model.s.nested.obj.text.$.view()).toBe(model.s.nested.obj.text.$.view());
});

describe('non-typed access', () => {
  test('can access PeritextApi using path selector', () => {
    const model = ModelWithExt.create(schema);
    const api = model.api.vec(['nested', 'obj', 'text']);
    expect(api).toBeInstanceOf(VecApi);
    const api2 = api.asExt();
    expect(api2).toBeInstanceOf(PeritextApi);
    model.api.str(['nested', 'obj', 'text', 1, 0]).ins(12, '!');
    expect(api.view()).toBe('Hello, world!\n');
  });

  test('can access PeritextApi using JSON Pointer path selector', () => {
    const model = ModelWithExt.create(schema);
    const api = model.api.vec('/nested/obj/text');
    expect(api).toBeInstanceOf(VecApi);
    const api2 = api.asExt();
    expect(api2).toBeInstanceOf(PeritextApi);
    model.api.str('/nested/obj/text/1/0').ins(12, '!');
    expect(api.view()).toBe('Hello, world!\n');
  });

  test('can access PeritextApi using step-wise selector', () => {
    const model = ModelWithExt.create(schema);
    const api = model.api.in('nested').in('obj').in('text').asVec();
    expect(api).toBeInstanceOf(VecApi);
    const api2 = api.asExt();
    expect(api2).toBeInstanceOf(PeritextApi);
    model.api.in('nested').in('obj').in('text').in(1).in(0).asStr().ins(12, '!');
    model.api.in('/nested/obj/text/1/0').asStr().ins(12, '!');
    model.api.in(['nested', 'obj', 'text', 1, 0]).asStr().ins(12, '!');
    expect(api.view()).toBe('Hello, world!!!\n');
  });

  test('can access PeritextApi .asExt(peritext) with typing', () => {
    const model = ModelWithExt.create(schema);
    const api = model.api.in('nested').in('obj').in('text').asVec();
    expect(api).toBeInstanceOf(VecApi);
    const api2 = model.api.in('nested').in('obj').in('text').asExt(ext.peritext);
    expect(api2).toBeInstanceOf(PeritextApi);
  });

  test('can access PeritextApi .ext(peritext) with typing', () => {
    const model = ModelWithExt.create(schema);
    const api = model.api.in('nested').in('obj').in('text').asVec();
    expect(api).toBeInstanceOf(VecApi);
    const api2 = api.asExt(ext.peritext);
    expect(api2).toBeInstanceOf(PeritextApi);
  });
});

describe('typed access', () => {
  test('can access PeritextNode in type safe way (using the proxy selector)', () => {
    const model = ModelWithExt.create(schema);
    let api = model.s.nested.obj.text.toExt();
    expect(api).toBeInstanceOf(PeritextApi);
    api = new PeritextApi(api.node, api.api);
  });

  test('can access raw text "str" node in type safe way', () => {
    const model = ModelWithExt.create(schema);
    const str = model.s.nested.obj.text.toExt().text();
    expect(str).toBeInstanceOf(StrApi);
    str.ins(str.length() - 1, '!');
    expect(model.view().nested.obj.text).toBe('Hello, world!\n');
  });

  test('can access slices "arr" node in type safe way', () => {
    const model = ModelWithExt.create(schema);
    const arr = model.s.nested.obj.text.toExt().slices();
    expect(arr).toBeInstanceOf(ArrApi);
    expect(arr.view()).toEqual([]);
  });

  test('can access PeritextApi using parent proxy selector', () => {
    const model = ModelWithExt.create(schema);
    const api = model.s.nested.obj.text.$;
    expect(api).toBeInstanceOf(VecApi);
    let node = api.node.ext();
    expect(node).toBeInstanceOf(PeritextNode);
    node = new PeritextNode(node.data);
    let api2 = api.asExt()!;
    expect(api2).toBeInstanceOf(PeritextApi);
    api2 = new PeritextApi(node, api.api);
  });

  test('can access Peritext context and Editor', () => {
    const model = ModelWithExt.create(schema);
    const api = model.s.nested.obj.text.toExt();
    expect(api.txt).toBeInstanceOf(Peritext);
    expect(api.editor).toBeInstanceOf(Editor);
  });

  test('can modify Peritext document', () => {
    const model = ModelWithExt.create(schema);
    const api = model.s.nested.obj.text.toExt();
    expect(api.view()).toBe('Hello, world\n');
    api.editor.cursor.setAt(12);
    api.editor.insert('!');
    expect(api.view()).toBe('Hello, world!\n');
  });
});
