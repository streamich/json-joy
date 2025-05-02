import {Diff} from '../Diff';
import {InsStrOp} from '../../json-crdt-patch';
import {Model} from '../../json-crdt/model';
import {JsonNode} from '../../json-crdt/nodes';

const assertDiff = (model: Model<any>, src: JsonNode, dst: unknown) => {
  const patch = new Diff(model).diff(src, dst);
  // console.log(patch + '');
  model.applyPatch(patch);
  const view = src.view();
  expect(view).toEqual(dst);
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
});
