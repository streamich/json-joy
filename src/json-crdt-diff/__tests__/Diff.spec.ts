import {Diff} from '../Diff';
import {InsStrOp, s} from '../../json-crdt-patch';
import {Model} from '../../json-crdt/model';
import {JsonNode, ValNode} from '../../json-crdt/nodes';
import {b} from '@jsonjoy.com/util/lib/buffers/b';

const assertDiff = (model: Model<any>, src: JsonNode, dst: unknown) => {
  const patch1 = new Diff(model).diff(src, dst);
  // console.log(model + '');
  // console.log(patch1 + '');
  model.applyPatch(patch1);
  // console.log(model + '');
  expect(src.view()).toEqual(dst);
  const patch2 = new Diff(model).diff(src, dst);
  // console.log(patch2 + '');
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

  test('two inserts', () => {
    const model = Model.create();
    const src = '23';
    model.api.root({str: src});
    const str = model.api.str(['str']);
    const dst = '2x3y';
    const patch = new Diff(model).diff(str.node, dst);
    expect(str.view()).toBe(src);
    model.applyPatch(patch);
    expect(str.view()).toBe(dst);
  });

  test('inserts and deletes', () => {
    const model = Model.create();
    const src = 'hello  world';
    model.api.root({str: src});
    const str = model.api.str(['str']);
    const dst = 'Hello world!';
    const patch = new Diff(model).diff(str.node, dst);
    expect(str.view()).toBe(src);
    model.applyPatch(patch);
    expect(str.view()).toBe(dst);
  });
});

describe('bin', () => {
  test('insert', () => {
    const model = Model.create();
    const bin = b(1, 2, 3, 4, 5);
    model.api.root({bin});
    const str = model.api.bin(['bin']);
    const dst = b(1, 2, 3, 4, 123, 5);
    const patch = new Diff(model).diff(str.node, dst);
    expect(patch.ops.length).toBe(1);
    expect(patch.ops[0].name()).toBe('ins_bin');
    expect((patch.ops[0] as InsStrOp).data).toEqual(b(123));
    expect(str.view()).toEqual(bin);
    model.applyPatch(patch);
    expect(str.view()).toEqual(dst);
  });

  test('delete', () => {
    const model = Model.create();
    const src = b(1, 2, 3, 4, 5);
    model.api.root({bin: src});
    const bin = model.api.bin(['bin']);
    const dst = b(1, 2, 3, 4);
    const patch = new Diff(model).diff(bin.node, dst);
    expect(patch.ops.length).toBe(1);
    expect(patch.ops[0].name()).toBe('del');
    expect(bin.view()).toEqual(src);
    model.applyPatch(patch);
    expect(bin.view()).toEqual(dst);
  });

  test('inserts and deletes', () => {
    const model = Model.create();
    const src = b(1, 2, 3, 4, 5);
    model.api.root({bin: src});
    const bin = model.api.bin(['bin']);
    const dst = b(2, 3, 4, 5, 6);
    const patch = new Diff(model).diff(bin.node, dst);
    expect(bin.view()).toEqual(src);
    model.applyPatch(patch);
    expect(bin.view()).toEqual(dst);
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
        inserted: null,
        edit: 'Abc!',
      },
    };
    const model = Model.create();
    model.api.root(src);
    assertDiff(model, model.root, dst);
  });
});

describe('vec', () => {
  test('can add an element', () => {
    const model = Model.create(s.vec(s.con(1)));
    const dst = [1, 2];
    assertDiff(model, model.root, dst);
  });

  test('can remove an element', () => {
    const model = Model.create(s.vec(s.con(1), s.con(2)));
    const dst = [1];
    assertDiff(model, model.root, dst);
  });

  test('can replace element', () => {
    const model = Model.create(s.vec(s.con(1)));
    const dst = [2];
    assertDiff(model, model.root, dst);
    expect(() => model.api.val([0])).toThrow();
  });

  test('can replace nested "val" node', () => {
    const schema = s.vec(s.val(s.con(1)));
    const model = Model.create(schema);
    const dst = [2];
    assertDiff(model, model.root, dst);
    const node = model.api.val([0]);
    expect(node.node).toBeInstanceOf(ValNode);
  });
});

describe('arr', () => {
  describe('insert', () => {
    test('can add an element', () => {
      const model = Model.create();
      model.api.root([1]);
      const dst = [1, 2];
      assertDiff(model, model.root, dst);
    });

    test('can add an element (when list of "con")', () => {
      const model = Model.create(s.arr([s.con(1)]));
      const dst = [1, 2];
      assertDiff(model, model.root, dst);
    });

    test('can add two elements sequentially', () => {
      const model = Model.create();
      model.api.root([1, 4]);
      const dst = [1, 2, 3, 4];
      assertDiff(model, model.root, dst);
    });
  });

  describe('delete', () => {
    test('can remove an element (end of list)', () => {
      const model = Model.create();
      model.api.root([1, 2, 3]);
      const dst = [1, 2];
      assertDiff(model, model.root, dst);
    });

    test('can remove a "con" element (end of list)', () => {
      const model = Model.create(s.arr([s.con(1), s.con(2), s.con(3)]));
      const dst = [1, 2];
      assertDiff(model, model.root, dst);
    });

    test('can remove an element (start of list)', () => {
      const model = Model.create();
      model.api.root([1, 2]);
      const dst = [2];
      assertDiff(model, model.root, dst);
    });

    test('can remove an element (middle list)', () => {
      const model = Model.create();
      model.api.root([1, 2, 3]);
      const dst = [1, 3];
      assertDiff(model, model.root, dst);
    });

    test('can remove whole list', () => {
      const model = Model.create();
      model.api.root([1, 2, 3]);
      const dst: number[] = [];
      assertDiff(model, model.root, dst);
    });
  });

  describe('replace', () => {
    test('can replace an element', () => {
      const model = Model.create();
      model.api.root([1, 2, 3]);
      const dst: number[] = [1, 0, 3];
      assertDiff(model, model.root, dst);
    });

    test('can replace an element (when elements are "con")', () => {
      const model = Model.create(s.arr([s.con(1), s.con(2), s.con(3)]));
      const dst: number[] = [1, 0, 3];
      assertDiff(model, model.root, dst);
    });

    test('can replace an element (different type)', () => {
      const model = Model.create();
      model.api.root([1, 2, 3]);
      const dst: unknown[] = [1, 'aha', 3];
      assertDiff(model, model.root, dst);
    });

    test('can replace an element (when elements are "con" and different type)', () => {
      const model = Model.create(s.arr([s.con(1), s.con(2), s.con(3)]));
      const dst: unknown[] = [1, 'asdf', 3];
      assertDiff(model, model.root, dst);
    });

    test('replace nested array - 1', () => {
      const model = Model.create();
      model.api.root([[2]]);
      const dst: unknown[] = [2];
      assertDiff(model, model.root, dst);
    });

    test('replace nested array - 2', () => {
      const model = Model.create();
      model.api.root([[2]]);
      const dst: unknown[] = [2, 1];
      assertDiff(model, model.root, dst);
    });

    test('replace nested array - 3', () => {
      const model = Model.create();
      model.api.root([[2]]);
      const dst: unknown[] = [1, 2, 3];
      assertDiff(model, model.root, dst);
    });

    test('replace nested array - 4', () => {
      const model = Model.create();
      model.api.root([1, [2], 3]);
      const dst: unknown[] = [1, 2, 3, 4];
      assertDiff(model, model.root, dst);
    });

    test('replace nested array - 5', () => {
      const model = Model.create();
      model.api.root([1, [2, 2.4], 3]);
      const dst: unknown[] = [1, 2, 3, 4];
      assertDiff(model, model.root, dst);
    });

    test('diff first element, and various replacements later', () => {
      const model = Model.create();
      model.api.root([[1, 2, 3, 4, 5], 4, 5, 6, 7, 9, 0]);
      const dst: unknown[] = [[1, 2], 4, 77, 7, 'xyz'];
      assertDiff(model, model.root, dst);
    });

    test('replaces both elements', () => {
      const model = Model.create();
      model.api.root([9, 0]);
      const dst: unknown[] = ['xyz'];
      assertDiff(model, model.root, dst);
    });

    test('nested changes', () => {
      const model = Model.create();
      model.api.root([1, 2, [1, 2, 3, 4, 5, 6], 4, 5, 6, 7, 8, 9, 0]);
      const dst: unknown[] = ['2', [1, 2, 34, 5], 4, 77, 7, 8, 'xyz'];
      assertDiff(model, model.root, dst);
    });
  });
});

describe('scenarios', () => {
  test('link element annotation', () => {
    const model = Model.create(s.obj({
      href: s.str('http://example.com/page?tab=1'),
      title: s.str('example'),
    }));
    const dst = {
      href: 'https://example.com/page-2',
      title: 'Example page',
    };
    assertDiff(model, model.root, dst);
  });
});
