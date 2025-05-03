import {Diff} from '../Diff';
import {InsStrOp, s} from '../../json-crdt-patch';
import {Model} from '../../json-crdt/model';
import {JsonNode} from '../../json-crdt/nodes';

const assertDiff = (model: Model<any>, src: JsonNode, dst: unknown) => {
  const patch1 = new Diff(model).diff(src, dst);
  // console.log(patch1 + '');
  model.applyPatch(patch1);
  expect(src.view()).toEqual(dst);
  // console.log(model + '');
  const patch2 = new Diff(model).diff(src, dst);
  expect(patch2.ops.length).toBe(0);
};

describe('str', () => {
  test('insert', () => {
    const model = Model.create();
    const src = 'hello world';
    model.api.root({str: src});
    const str = model.api.str(['str']);
    const dst = 'hello world!';
    const patch = new Diff(model).diff(str.node, dst);
    expect(patch.ops.length).toBe(1);
    expect(patch.ops[0].name()).toBe('ins_str');
    expect((patch.ops[0] as InsStrOp).data).toBe('!');
    expect(str.view()).toBe(src);
    model.applyPatch(patch);
    expect(str.view()).toBe(dst);
  });

  test('delete', () => {
    const model = Model.create();
    const src = 'hello  world';
    model.api.root({str: src});
    const str = model.api.str(['str']);
    const dst = 'hello world';
    const patch = new Diff(model).diff(str.node, dst);
    expect(patch.ops.length).toBe(1);
    expect(patch.ops[0].name()).toBe('del');
    expect(str.view()).toBe(src);
    model.applyPatch(patch);
    expect(str.view()).toBe(dst);
  });

  test('inserts and deletes', () => {
    const model = Model.create();
    const src = 'hello  world';
    model.api.root({str: src});
    const str = model.api.str(['str']);
    const dst = 'Hello, world!';
    const patch = new Diff(model).diff(str.node, dst);
    expect(str.view()).toBe(src);
    model.applyPatch(patch);
    expect(str.view()).toBe(dst);
  });
});

describe('obj', () => {
  test('can remove a key', () => {
    const model = Model.create();
    model.api.root({
      foo: 'abc',
      bar: 'xyz',
    });
    const dst = {foo: 'abc'};
    assertDiff(model, model.root.child(), dst);
  });

  test('can add a key', () => {
    const model = Model.create();
    model.api.root({
      foo: 'abc',
    });
    const dst = {foo: 'abc', bar: 'xyz'};
    assertDiff(model, model.root.child(), dst);
  });

  test('can edit nested string', () => {
    const model = Model.create();
    model.api.root({foo: 'abc'});
    const dst = {foo: 'abc!'};
    assertDiff(model, model.root.child(), dst);
  });

  test('can update "con" string key', () => {
    const model = Model.create(s.obj({foo: s.con('abc')}));
    const dst = {foo: 'abc!'};
    assertDiff(model, model.root.child(), dst);
  });

  test('nested object', () => {
    const src = {
      nested: {
        remove: 123,
        edit: 'abc',
      },
    };
    const dst = {
      nested: {
        inserted: [null],
        edit: 'Abc!',
      },
    };
    const model = Model.create();
    model.api.root(src);
    assertDiff(model, model.root, dst);
  });
});
