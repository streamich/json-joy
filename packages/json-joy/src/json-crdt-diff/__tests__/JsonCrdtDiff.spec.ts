import {JsonCrdtDiff} from '../JsonCrdtDiff';
import {type InsStrOp, s, ts} from '../../json-crdt-patch';
import {Model} from '../../json-crdt/model';
import {type JsonNode, ValNode} from '../../json-crdt/nodes';
import {b} from '@jsonjoy.com/util/lib/buffers/b';
import {cmpSchema} from '../../json-crdt/equal';
import {toSchema} from '../../json-crdt/schema/toSchema';

const assertDiff = (model: Model<any>, src: JsonNode, dst: unknown) => {
  const patch1 = new JsonCrdtDiff(model).diff(src, dst);
  // console.log(model + '');
  // console.log(dst);
  // console.log(patch1 + '');
  model.applyPatch(patch1);
  // console.log(model + '');
  expect(src.view()).toEqual(dst);
  const patch2 = new JsonCrdtDiff(model).diff(src, dst);
  // console.log(patch2 + '');
  expect(patch2.ops.length).toBe(0);
  return patch1;
};

const assertDiff2 = (src: unknown, dst: unknown) => {
  const model = Model.create();
  model.api.set(src);
  assertDiff(model, model.root.child(), dst);
};

describe('con', () => {
  test('binary in "con"', () => {
    const model = Model.create(
      s.obj({
        field: s.con(new Uint8Array([1, 2, 3])),
      }),
    );
    const dst = {
      field: new Uint8Array([1, 2, 3, 4]),
    };
    assertDiff(model, model.root, dst);
  });

  test('timestamp', () => {
    const model = Model.create(
      s.obj({
        field: s.con(ts(5, 5)),
      }),
    );
    const dst = {
      field: ts(6, 6),
    };
    assertDiff(model, model.root, dst);
  });

  test('does nothing when dst schema specifies the same constant', () => {
    const model = Model.create(s.con(1));
    const patch = model.$.$?.merge(s.con(1));
    expect(patch).toBe(undefined);
  });
});

describe('val', () => {
  test('does nothing when dst schema specifies the "val" node', () => {
    const model = Model.create(
      s.obj({
        node: s.val(s.con(1)),
      }),
    );
    const patch = model.$.node.$?.merge(s.val(s.con(1)));
    expect(patch).toBe(undefined);
    const patch2 = model.$.node.$?.merge(s.val(s.con(2)));
    expect(patch2?.ops.length).toBe(2);
  });
});

describe('str', () => {
  test('insert', () => {
    const model = Model.create();
    const src = 'hello world';
    model.api.set({str: src});
    const str = model.api.str(['str']);
    const dst = 'hello world!';
    const patch = new JsonCrdtDiff(model).diff(str.node, dst);
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
    model.api.set({str: src});
    const str = model.api.str(['str']);
    const dst = 'hello world';
    const patch = new JsonCrdtDiff(model).diff(str.node, dst);
    expect(patch.ops.length).toBe(1);
    expect(patch.ops[0].name()).toBe('del');
    expect(str.view()).toBe(src);
    model.applyPatch(patch);
    expect(str.view()).toBe(dst);
  });

  test('two inserts', () => {
    const model = Model.create();
    const src = '23';
    model.api.set({str: src});
    const str = model.api.str(['str']);
    const dst = '2x3y';
    const patch = new JsonCrdtDiff(model).diff(str.node, dst);
    expect(str.view()).toBe(src);
    model.applyPatch(patch);
    expect(str.view()).toBe(dst);
  });

  test('inserts and deletes', () => {
    const model = Model.create();
    const src = 'hello  world';
    model.api.set({str: src});
    const str = model.api.str(['str']);
    const dst = 'Hello world!';
    const patch = new JsonCrdtDiff(model).diff(str.node, dst);
    expect(str.view()).toBe(src);
    model.applyPatch(patch);
    expect(str.view()).toBe(dst);
  });

  test('does nothing when dst schema specifies the same "str" node', () => {
    const model = Model.create(s.str('abc'));
    const patch = model.$.$?.merge(s.str('abc'));
    expect(patch).toBe(undefined);
  });

  test('inserts text when dst specified as schema node', () => {
    const model = Model.create(s.str('abc'));
    const patch = model.$.$?.merge(s.str('abc!'));
    expect(patch?.ops.length).toBe(1);
    expect(patch?.ops[0].name()).toBe('ins_str');
  });
});

describe('bin', () => {
  test('insert', () => {
    const model = Model.create();
    const bin = b(1, 2, 3, 4, 5);
    model.api.set({bin});
    const str = model.api.bin(['bin']);
    const dst = b(1, 2, 3, 4, 123, 5);
    const patch = new JsonCrdtDiff(model).diff(str.node, dst);
    expect(patch.ops.length).toBe(1);
    expect(patch.ops[0].name()).toBe('ins_bin');
    expect((patch.ops[0] as InsStrOp).data).toEqual(b(123));
    expect(str.view()).toEqual(bin);
    model.applyPatch(patch);
    expect(str.view()).toEqual(dst);
  });

  test('creates empty patch for equal values', () => {
    const model = Model.create();
    const bin = b(1, 2, 3, 4, 5);
    model.api.set({bin});
    const str = model.api.bin(['bin']);
    const dst = b(1, 2, 3, 4, 5);
    const patch = new JsonCrdtDiff(model).diff(str.node, dst);
    expect(patch.ops.length).toBe(0);
  });

  test('delete', () => {
    const model = Model.create();
    const src = b(1, 2, 3, 4, 5);
    model.api.set({bin: src});
    const bin = model.api.bin(['bin']);
    const dst = b(1, 2, 3, 4);
    const patch = new JsonCrdtDiff(model).diff(bin.node, dst);
    expect(patch.ops.length).toBe(1);
    expect(patch.ops[0].name()).toBe('del');
    expect(bin.view()).toEqual(src);
    model.applyPatch(patch);
    expect(bin.view()).toEqual(dst);
  });

  test('inserts and deletes', () => {
    const model = Model.create();
    const src = b(1, 2, 3, 4, 5);
    model.api.set({bin: src});
    const bin = model.api.bin(['bin']);
    const dst = b(2, 3, 4, 5, 6);
    const patch = new JsonCrdtDiff(model).diff(bin.node, dst);
    expect(bin.view()).toEqual(src);
    model.applyPatch(patch);
    expect(bin.view()).toEqual(dst);
  });

  test('does nothing when dst schema specifies the same "bin" node', () => {
    const model = Model.create(s.bin(new Uint8Array([1, 2, 3])));
    const patch = model.$.$?.merge(s.bin(new Uint8Array([1, 2, 3])));
    expect(patch).toBe(undefined);
  });
});

describe('obj', () => {
  test('can remove a key', () => {
    const model = Model.create();
    model.api.set({
      foo: 'abc',
      bar: 'xyz',
    });
    const dst = {foo: 'abc'};
    assertDiff(model, model.root.child(), dst);
  });

  test('can add a key', () => {
    const model = Model.create();
    model.api.set({
      foo: 'abc',
    });
    const dst = {foo: 'abc', bar: 'xyz'};
    assertDiff(model, model.root.child(), dst);
  });

  test('can edit nested string', () => {
    const model = Model.create();
    model.api.set({foo: 'abc'});
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
    model.api.set(src);
    assertDiff(model, model.root, dst);
  });

  test('can change "str" key to number or back', () => {
    assertDiff2({foo: 'abc'}, {foo: 123});
    assertDiff2({foo: 123}, {foo: 'abc'});
  });

  test('does nothing when dst schema specifies the same "bin" node', () => {
    const model = Model.create(s.obj({foo: s.con('bar')}));
    const patch = model.$.$?.merge(s.obj({foo: s.con('bar')}));
    expect(patch).toBe(undefined);
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

  test('does not update equivalent Timestamp values', () => {
    const schema = s.vec(s.con(ts(1, 1)));
    const model = Model.create(schema);
    const dst = [ts(1, 1)];
    const patch = assertDiff(model, model.root, dst);
    expect(patch.ops.length).toBe(0);
    const dst2 = [ts(99, 99)];
    const patch2 = assertDiff(model, model.root, dst2);
    expect(patch2.ops.length).not.toBe(0);
  });

  test('does not update value when equivalent value wrapped in "con" node', () => {
    const schema = s.vec(s.con('abc'));
    const model = Model.create(schema);
    const dst = [s.con('abc')];
    const patch = new JsonCrdtDiff(model).diff(model.root, dst);
    model.applyPatch(patch);
    expect(model.view()).toEqual(['abc']);
    const dst2 = [s.con('xyz')];
    const patch2 = new JsonCrdtDiff(model).diff(model.root, dst2);
    model.applyPatch(patch2);
    expect(model.view()).toEqual(['xyz']);
  });

  test('replaces "con" member with another "con" node', () => {
    const schema = s.vec(s.con('abc'));
    const model = Model.create(schema);
    const dst = ['xyz'];
    const patch = new JsonCrdtDiff(model).diff(model.root, dst);
    model.applyPatch(patch);
    expect(model.view()).toEqual(['xyz']);
    const schema2 = toSchema(model.root.child()) as any;
    expect(cmpSchema(schema2, schema, false)).toBe(true);
    expect(cmpSchema(schema2, schema, true)).toBe(false);
  });

  test('can merge "vec" nodes with timestamps', () => {
    const model = Model.create(
      s.vec(
        s.con(ts(1, 1)),
        s.con(ts(1, 2)),
        s.con({sid: 1, time: 3}),
        s.con({sid: 1, time: 4}),
        s.con({sid: 1, time: 44}),
        s.con(ts(1, 3)),
      ),
    );
    model.$.$?.merge([
      s.con(ts(2, 1)),
      123,
      s.con({sid: 1, time: 3}),
      s.con(ts(1, 4)),
      ts(1, 44),
      s.con({sid: 1, time: 3}),
    ]);
    expect(toSchema(model.root.child()) + '').toEqual(
      s.vec(
        s.con(ts(2, 1)),
        s.con(123),
        s.con({sid: 1, time: 3}),
        s.con(ts(1, 4)),
        s.con(ts(1, 44)),
        s.con({sid: 1, time: 3}),
      ) + '',
    );
  });

  test('can can cast "arr" node to "vec"', () => {
    const model = Model.create(
      s.obj({
        arr: s.arr([s.con(1), s.con(2), s.con(3)]),
      }),
    );
    expect(toSchema(model.root.child()) + '').toEqual(
      s.obj({
        arr: s.arr([s.con(1), s.con(2), s.con(3)]),
      }) + '',
    );
    model.$.$?.merge({
      arr: s.vec(s.con(1), s.con(2), s.con(3)),
    });
    expect(toSchema(model.root.child()) + '').toEqual(
      s.obj({
        arr: s.vec(s.con(1), s.con(2), s.con(3)),
      }) + '',
    );
  });

  test('can can cast "vec" node to "arr"', () => {
    const model = Model.create(
      s.obj({
        arr: s.vec(s.con(1), s.con(2), s.con(3)),
      }),
    );
    expect(toSchema(model.root.child()) + '').toEqual(
      s.obj({
        arr: s.vec(s.con(1), s.con(2), s.con(3)),
      }) + '',
    );
    model.$.$?.merge({
      arr: s.arr([s.con(1), s.con(2), s.con(3)]),
    });
    expect(toSchema(model.root.child()) + '').toEqual(
      s.obj({
        arr: s.arr([s.con(1), s.con(2), s.con(3)]),
      }) + '',
    );
  });

  test('does nothing when rewriting "vec" with "vec"', () => {
    const model = Model.create(
      s.obj({
        arr: s.vec(s.con(1), s.con(2), s.con(3)),
      }),
    );
    expect(toSchema(model.root.child()) + '').toEqual(
      s.obj({
        arr: s.vec(s.con(1), s.con(2), s.con(3)),
      }) + '',
    );
    const patch = model.$.$?.merge({
      arr: s.vec(s.con(1), s.con(2), s.con(3)),
    });
    expect(patch).toBe(undefined);
    const patch2 = model.$.$?.merge({
      arr: s.vec(s.con(1), s.con(2), s.con(3), s.con(4)),
    });
    expect(patch2!.ops.length).toBe(2);
  });

  test('does nothing when dst schema specifies the same "vec" node', () => {
    const model = Model.create(s.obj({foo: s.vec(s.con('bar'))}));
    const patch = model.$.$?.merge(s.obj({foo: s.vec(s.con('bar'))}));
    expect(patch).toBe(undefined);
  });
});

describe('arr', () => {
  describe('insert', () => {
    test('can add an element', () => {
      const model = Model.create();
      model.api.set([1]);
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
      model.api.set([1, 4]);
      const dst = [1, 2, 3, 4];
      assertDiff(model, model.root, dst);
    });
  });

  describe('delete', () => {
    test('can remove an element (end of list)', () => {
      const model = Model.create();
      model.api.set([1, 2, 3]);
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
      model.api.set([1, 2]);
      const dst = [2];
      assertDiff(model, model.root, dst);
    });

    test('can remove an element (middle list)', () => {
      const model = Model.create();
      model.api.set([1, 2, 3]);
      const dst = [1, 3];
      assertDiff(model, model.root, dst);
    });

    test('can remove whole list', () => {
      const model = Model.create();
      model.api.set([1, 2, 3]);
      const dst: number[] = [];
      assertDiff(model, model.root, dst);
    });
  });

  describe('replace', () => {
    test('can replace an element', () => {
      const model = Model.create();
      model.api.set([1, 2, 3]);
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
      model.api.set([1, 2, 3]);
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
      model.api.set([[2]]);
      const dst: unknown[] = [2];
      assertDiff(model, model.root, dst);
    });

    test('replace nested array - 2', () => {
      const model = Model.create();
      model.api.set([[2]]);
      const dst: unknown[] = [2, 1];
      assertDiff(model, model.root, dst);
    });

    test('replace nested array - 3', () => {
      const model = Model.create();
      model.api.set([[2]]);
      const dst: unknown[] = [1, 2, 3];
      assertDiff(model, model.root, dst);
    });

    test('replace nested array - 4', () => {
      const model = Model.create();
      model.api.set([1, [2], 3]);
      const dst: unknown[] = [1, 2, 3, 4];
      assertDiff(model, model.root, dst);
    });

    test('replace nested array - 5', () => {
      const model = Model.create();
      model.api.set([1, [2, 2.4], 3]);
      const dst: unknown[] = [1, 2, 3, 4];
      assertDiff(model, model.root, dst);
    });

    test('diff first element, and various replacements later', () => {
      const model = Model.create();
      model.api.set([[1, 2, 3, 4, 5], 4, 5, 6, 7, 9, 0]);
      const dst: unknown[] = [[1, 2], 4, 77, 7, 'xyz'];
      assertDiff(model, model.root, dst);
    });

    test('replaces both elements', () => {
      const model = Model.create();
      model.api.set([9, 0]);
      const dst: unknown[] = ['xyz'];
      assertDiff(model, model.root, dst);
    });

    test('nested changes', () => {
      const model = Model.create();
      model.api.set([1, 2, [1, 2, 3, 4, 5, 6], 4, 5, 6, 7, 8, 9, 0]);
      const dst: unknown[] = ['2', [1, 2, 34, 5], 4, 77, 7, 8, 'xyz'];
      assertDiff(model, model.root, dst);
    });
  });

  test('does nothing when dst schema specifies the same "arr" node', () => {
    const model = Model.create(s.arr([s.con('bar')]));
    const patch = model.$.$?.merge(s.arr([s.con('bar')]));
    expect(patch).toBe(undefined);
  });
});

describe('scenarios', () => {
  test('link element annotation', () => {
    const model = Model.create(
      s.obj({
        href: s.str('http://example.com/page?tab=1'),
        title: s.str('example'),
      }),
    );
    const dst = {
      href: 'https://example.com/page-2',
      title: 'Example page',
    };
    assertDiff(model, model.root, dst);
  });
});
