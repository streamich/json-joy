import {s} from '../../../../json-crdt-patch';
import {Model} from '../../Model';
import {ConApi, ObjApi} from '../nodes';
import {createTypedModel, createUntypedModel} from './fixtures';

describe('.find()', () => {
  test('can resolve multiple nested "val" nodes in the middle of path', () => {
    const doc = Model.create();
    doc.api.set(
      s.obj({
        obj: s.val(
          s.val(
            s.val(
              s.obj({
                key: s.str('value'),
              }),
            ),
          ),
        ),
      }),
    );
    const node = doc.api.find(['obj', 'key']);
    expect(node.view()).toBe('value');
  });

  test('can resolve multiple nested "val" nodes at the end of path', () => {
    const doc = Model.create();
    doc.api.set(
      s.obj({
        obj: s.obj({
          key: s.val(s.val(s.val(s.str('value')))),
        }),
      }),
    );
    const node = doc.api.find(['obj', 'key']);
    expect(node.view()).toBe('value');
  });

  test('can resolve multiple nested "val" nodes in the beginning of path', () => {
    const doc = Model.create();
    doc.api.set(
      s.val(
        s.val(
          s.val(
            s.obj({
              obj: s.obj({
                key: s.str('value'),
              }),
            }),
          ),
        ),
      ),
    );
    const node = doc.api.find(['obj', 'key']);
    expect(node.view()).toBe('value');
  });
});

describe('.read()', () => {
  test('can retrieve own view', () => {
    const doc = Model.create();
    doc.api.set({
      arr: [1, 2, 3],
    });
    const arr = doc.api.arr(['arr']);
    expect(arr.read()).toEqual([1, 2, 3]);
    expect(arr.read('')).toEqual([1, 2, 3]);
    expect(arr.read([])).toEqual([1, 2, 3]);
  });

  test('can retrieve array element', () => {
    const doc = Model.create();
    doc.api.set({
      arr: [1, 2, 3],
    });
    const arr = doc.api.arr(['arr']);
    expect(arr.read('/0')).toEqual(1);
    expect(arr.read([0])).toEqual(1);
    expect(arr.read('/2')).toEqual(3);
    expect(arr.read([2])).toEqual(3);
    expect(arr.read(['2'])).toEqual(3);
  });

  test('retrieve deep within document', () => {
    const doc = createUntypedModel();
    expect(doc.api.read('/foo')).toEqual('bar');
    expect(doc.api.read('/foo')).toEqual('bar');
    expect(doc.api.read('/arr/0')).toEqual(1);
    expect(doc.api.read('/arr/2/nested/1')).toEqual(2);
    expect(doc.api.read('/arr/2/deep')).toEqual({value: 4});
    expect(doc.api.read('/arr/2/deep/value')).toEqual(4);
    expect(doc.api.read(['foo'])).toEqual('bar');
    expect(doc.api.read(['obj', 'nested', 'value'])).toEqual(42);
    expect(doc.api.read(['arr', 2, 'nested', 1])).toEqual(2);
    expect(doc.api.read(['arr', 2, 'deep'])).toEqual({value: 4});
    expect(doc.api.read(['arr', 2, 'deep', 'value'])).toEqual(4);
    expect(doc.api.read(['obj', 'nested', 'deep', 'another'])).toEqual('value');
  });

  test('returns "undefined" for non-existing path', () => {
    const doc = createUntypedModel();
    expect(doc.api.read('/asdfasdfasdf')).toBe(undefined);
    expect(doc.api.read('/obj/asdf')).toBe(undefined);
    expect(doc.api.read('/arr/10')).toBe(undefined);
    expect(doc.api.read(['asdfasdfasdf'])).toBe(undefined);
    expect(doc.api.read(['obj', 'asdf'])).toBe(undefined);
    expect(doc.api.read(['arr', 10])).toBe(undefined);
  });

  test('can read within a "con" node', () => {
    const doc = Model.create(
      s.obj({
        con: s.con({
          foo: [1, 2, 3],
        }),
      }),
    );
    expect(doc.api.read('/con/foo/1')).toBe(2);
  });
});

describe('.add()', () => {
  describe('"obj" node', () => {
    test('can add key to an object', () => {
      const doc = createTypedModel();
      expect(doc.api.read('/obj/newKey')).toBe(undefined);
      doc.api.add('/obj/newKey', 'newValue');
      expect(doc.api.read('/obj/newKey')).toBe('newValue');
    });

    test('can add key to root object', () => {
      const doc = createTypedModel();
      expect(doc.api.read('/newKey')).toBe(undefined);
      doc.api.add('/newKey', 'newValue');
      expect(doc.api.read('/newKey')).toBe('newValue');
    });

    test('can add key to root object - 2', () => {
      const doc = createTypedModel();
      expect(doc.api.read(['newKey'])).toBe(undefined);
      doc.api.add(['newKey'], 'newValue');
      expect(doc.api.read(['newKey'])).toBe('newValue');
    });

    test('can used on ObjApi', () => {
      const doc = createTypedModel();
      doc.$.obj.$!.add('/xxx', 'y');
      expect(doc.$.obj.$?.read('/xxx')).toBe('y');
      expect(doc.api.read('/obj/xxx')).toBe('y');
    });

    test('can overwrite key', () => {
      const doc = createTypedModel();
      expect(doc.api.read('/str')).toBe('abc');
      doc.api.add('/str', 'baz');
      expect(doc.api.read('/str')).toBe('baz');
      doc.api.add('/str', 'gg');
      expect(doc.api.read('/str')).toBe('gg');
    });

    test('returns true when key was added', () => {
      const doc = createTypedModel();
      const success1 = doc.api.add('/str', 1);
      const success2 = doc.api.add('/asdf', 2);
      expect(success1).toBe(true);
      expect(success2).toBe(true);
    });

    test('returns true when key was overwritten', () => {
      const doc = createTypedModel();
      doc.api.add('/str', 1);
      const success = doc.api.add('/str', 2);
      expect(success).toBe(true);
    });

    test('returns false when was not able to set key', () => {
      const doc = createTypedModel();
      const success1 = doc.api.add('/str/0/0', 1);
      const success2 = doc.api.add('/asdf/asdf/asdf', 1);
      expect(success1).toBe(false);
      expect(success2).toBe(false);
    });

    test('can delete a key by setting it to undefined', () => {
      const doc = createTypedModel();
      expect('str' in doc.view()).toBe(true);
      doc.api.add('/str', undefined);
      expect('str' in doc.view()).toBe(false);
      doc.api.add('/str', null);
      expect('str' in doc.view()).toBe(true);
      expect(doc.api.read('/str')).toBe(null);
    });

    test('can set key to a complex value', () => {
      const doc = createTypedModel();
      expect(doc.api.read('/obj/newKey')).toBe(undefined);
      doc.api.add('/obj/newKey', {nested: {deep: {value: 4}}});
      expect(doc.api.read('/obj/newKey')).toEqual({nested: {deep: {value: 4}}});
      expect((doc.$.obj as any).newKey.$ instanceof ObjApi).toBe(true);
    });

    test('can specify exact schema for the new value', () => {
      const doc = createTypedModel();
      expect(doc.api.read('/obj/newKey')).toBe(undefined);
      doc.api.add('/obj/newKey', s.con({nested: {deep: {value: 4}}}));
      expect(doc.api.read('/obj/newKey')).toEqual({nested: {deep: {value: 4}}});
      expect((doc.$.obj as any).newKey.$ instanceof ConApi).toBe(true);
    });
  });

  describe('"arr" node', () => {
    test('can add element to the end of array', () => {
      const doc = createTypedModel();
      expect(doc.api.read('/arr/2')).toBe(undefined);
      const success = doc.api.add('/arr/2', 'newValue');
      expect(doc.api.read('/arr/2')).toBe('newValue');
      expect(success).toBe(true);
    });

    test('can add element to the end of array when index too high', () => {
      const doc = createTypedModel();
      expect(doc.api.read('/arr/2')).toBe(undefined);
      const success = doc.api.add('/arr/9999', 'newValue');
      expect(doc.api.read('/arr/2')).toBe('newValue');
      expect(success).toBe(true);
    });

    test('can add element to the end of array when index is "-"', () => {
      const doc = createTypedModel();
      expect(doc.api.read('/arr/2')).toBe(undefined);
      const success = doc.api.add('/arr/-', 'newValue');
      expect(doc.api.read('/arr/2')).toBe('newValue');
      expect(success).toBe(true);
    });

    test('can add element to the beginning of array', () => {
      const doc = createTypedModel();
      expect(doc.api.read('/arr/0')).toBe('asdf');
      const success = doc.api.add('/arr/0', 0);
      expect(doc.api.read('/arr/0')).toBe(0);
      expect(doc.api.read('/arr/1')).toBe('asdf');
      expect(success).toBe(true);
    });

    test('can add element to the beginning of array (on "arr" node)', () => {
      const doc = createTypedModel();
      expect(doc.api.read('/arr/0')).toBe('asdf');
      const success = doc.api.arr('/arr').add('/0', 0);
      expect(doc.api.read('/arr/0')).toBe(0);
      expect(doc.api.read('/arr/1')).toBe('asdf');
      expect(success).toBe(true);
    });

    test('can add element to the middle of array', () => {
      const doc = createTypedModel();
      expect(doc.api.read('/arr/1')).toBe(0);
      const success = doc.api.add('/arr/1', 123);
      expect(doc.api.read('/arr/1')).toBe(123);
      expect(doc.api.read('/arr/2')).toBe(0);
      expect(success).toBe(true);
    });

    test('returns "false" when cannot insert into array', () => {
      const doc = createTypedModel();
      const success1 = doc.api.add('/arr/1.1', 123);
      const success2 = doc.api.add('/arr/adsf', 123);
      const success3 = doc.api.add('/arr/Infinity', 123);
      expect(success1).toBe(false);
      expect(success2).toBe(false);
      expect(success3).toBe(false);
    });

    test('"arr" should allow to insert multiple elements at once', () => {
      const doc = createTypedModel();
      expect(doc.api.read('/arr')).toEqual(['asdf', 0]);
      const success1 = doc.api.add('/arr/1', ['new1', 'new2']);
      expect(doc.api.read('/arr')).toEqual(['asdf', 'new1', 'new2', 0]);
      expect(success1).toBe(true);
    });

    test('"arr" should allow inserting an array', () => {
      const doc = createTypedModel();
      expect(doc.api.read('/arr')).toEqual(['asdf', 0]);
      const success1 = doc.api.add('/arr/1', [['new1', 'new2']]);
      expect(doc.api.read('/arr')).toEqual(['asdf', ['new1', 'new2'], 0]);
      expect(success1).toBe(true);
    });
  });

  describe('"vec" node', () => {
    test('can update elements', () => {
      const doc = createTypedModel();
      expect(doc.api.read('/vec/0')).toBe('asdf');
      doc.api.add('/vec/0', 'newValue');
      expect(doc.api.read('/vec/0')).toBe('newValue');
      expect(doc.api.read('/vec/1')).toBe(1234);
      doc.api.add('/vec/1', 5678);
      expect(doc.api.read('/vec/1')).toBe(5678);
      expect(doc.api.read('/vec/2')).toBe(true);
      doc.api.add('/vec/2', false);
      expect(doc.api.read('/vec/2')).toBe(false);
      expect(doc.api.read('/vec/3')).toBe(null);
      doc.api.add('/vec/3', 'newNull');
      expect(doc.api.read('/vec/3')).toBe('newNull');
    });
  });

  describe('"str" node', () => {
    test('can insert text', () => {
      const doc = createTypedModel();
      expect(doc.api.read('/obj/str')).toBe('asdf');
      doc.api.add('/obj/str/0', '0');
      expect(doc.api.read('/obj/str')).toBe('0asdf');
      doc.api.add('/obj/str/2', 'XX');
      expect(doc.api.read('/obj/str')).toBe('0aXXsdf');
      doc.api.add('/obj/str/5', '___');
      expect(doc.api.read('/obj/str')).toBe('0aXXs___df');
    });

    test('can append text', () => {
      const doc = createTypedModel();
      expect(doc.api.read('/obj/str')).toBe('asdf');
      doc.api.add('/obj/str/4', '4');
      expect(doc.api.read('/obj/str')).toBe('asdf4');
    });

    test('can append text - 2', () => {
      const doc = createTypedModel();
      expect(doc.api.read(['obj', 'str'])).toBe('asdf');
      doc.api.add(['obj', 'str', '-'], '! aha!');
      expect(doc.api.read(['obj', 'str'])).toBe('asdf! aha!');
    });
  });

  describe('"bin" node', () => {
    test('can insert text', () => {
      const doc = createTypedModel();
      expect(doc.api.read('/bin')).toEqual(new Uint8Array([1, 2, 3]));
      doc.api.add('/bin/0', new Uint8Array([0]));
      expect(doc.api.read('/bin')).toEqual(new Uint8Array([0, 1, 2, 3]));
      doc.api.add('/bin/2', new Uint8Array([99]));
      expect(doc.api.read('/bin')).toEqual(new Uint8Array([0, 1, 99, 2, 3]));
      doc.api.add('/bin/4', new Uint8Array([100]));
      expect(doc.api.read('/bin')).toEqual(new Uint8Array([0, 1, 99, 2, 100, 3]));
    });

    test('can append text', () => {
      const doc = createTypedModel();
      expect(doc.api.read('/bin')).toEqual(new Uint8Array([1, 2, 3]));
      doc.api.add('/bin/3', new Uint8Array([4]));
      expect(doc.api.read('/bin')).toEqual(new Uint8Array([1, 2, 3, 4]));
    });

    test('can append text - 2', () => {
      const doc = createTypedModel();
      expect(doc.api.read('/bin')).toEqual(new Uint8Array([1, 2, 3]));
      doc.api.add('/bin/-', new Uint8Array([4]));
      expect(doc.api.read('/bin')).toEqual(new Uint8Array([1, 2, 3, 4]));
    });
  });

  describe('"val" node', () => {
    test('when parent is wrapped in "val" node', () => {
      const doc = Model.create(
        s.obj({
          obj: s.val(
            s.obj({
              foo: s.str('bar'),
            }),
          ),
        }),
      );
      expect(doc.view()).toEqual({obj: {foo: 'bar'}});
      const success1 = doc.api.add('/obj/foo', 'baz');
      expect(doc.view()).toEqual({obj: {foo: 'baz'}});
      expect(success1).toBe(true);
    });

    test('when parent is wrapped in "val" node three times', () => {
      const doc = Model.create(
        s.obj({
          obj: s.val(
            s.val(
              s.val(
                s.obj({
                  foo: s.str('bar'),
                }),
              ),
            ),
          ),
        }),
      );
      expect(doc.view()).toEqual({obj: {foo: 'bar'}});
      const success1 = doc.api.add('/obj/foo', 'baz');
      expect(doc.view()).toEqual({obj: {foo: 'baz'}});
      expect(success1).toBe(true);
    });
  });
});

describe('.replace()', () => {
  describe('"obj" node', () => {
    test('can replace value in "obj" node', () => {
      const doc = createTypedModel();
      expect(doc.api.read('/obj/str')).toBe('asdf');
      const success = doc.api.replace('/obj/str', 'newValue');
      expect(doc.api.read('/obj/str')).toBe('newValue');
      expect(success).toBe(true);
    });

    test('can replace value in "obj" node - 2', () => {
      const doc = createTypedModel();
      expect(doc.api.read('/obj/str')).toBe('asdf');
      const success = doc.api.obj(['obj']).replace('/str', s.arr([s.con(true)]));
      expect(doc.api.read('/obj/str')).toEqual([true]);
      expect(success).toBe(true);
    });

    test('cannot replace non-existing key', () => {
      const doc = createTypedModel();
      const success = doc.api.replace('/obj/asdfasdf', 'newValue');
      expect(doc.api.read('/obj/asdfasdf')).toBe(undefined);
      expect(success).toBe(false);
    });

    test('cannot replace non-existing key - 2', () => {
      const doc = createTypedModel();
      const success = doc.api.obj('obj').replace('/asdfasdf', 'newValue');
      expect(doc.api.read('/obj/asdfasdf')).toBe(undefined);
      expect(success).toBe(false);
    });
  });

  describe('"arr" node', () => {
    test('can replace "val" value in "arr" node', () => {
      const doc = createTypedModel();
      expect(doc.api.read('/arr/1')).toBe(0);
      expect(doc.api.select('/arr')?.asArr().length()).toBe(2);
      const success = doc.api.replace('/arr/1', 'newValue');
      expect(doc.api.read('/arr/1')).toBe('newValue');
      expect(doc.api.select('/arr')?.asArr().length()).toBe(2);
      expect(success).toBe(true);
    });

    test('can replace non-"val" value in "arr" node', () => {
      const doc = createTypedModel();
      expect(doc.api.read('/arr/0')).toBe('asdf');
      expect(doc.api.select('/arr')?.asArr().length()).toBe(2);
      const success = doc.api.replace('/arr/0', 'newValue');
      expect(doc.api.read('/arr/0')).toBe('newValue');
      expect(doc.api.select('/arr')?.asArr().length()).toBe(2);
      expect(success).toBe(true);
    });
  });
});

describe('.remove()', () => {
  describe('"obj" node', () => {
    test('can remove value in "obj" node', () => {
      const doc = createTypedModel();
      expect(doc.api.read('/obj/str')).toBe('asdf');
      const success = doc.api.remove('/obj/str');
      expect(doc.api.read('/obj/str')).toBe(undefined);
      expect(success).toBe(true);
    });

    test('returns false if key does not exist', () => {
      const doc = createTypedModel();
      expect(doc.api.read('/obj/str')).toBe('asdf');
      const success = doc.api.remove('/obj/nonexistent');
      expect(doc.api.read('/obj/str')).toBe('asdf');
      expect(success).toBe(false);
    });
  });

  describe('"arr" node', () => {
    test('can remove value in "arr" node', () => {
      const doc = createTypedModel();
      expect(doc.api.read('/arr/1')).toBe(0);
      const success = doc.api.remove('/arr/1');
      expect(doc.api.read('/arr/1')).toBe(undefined);
      expect(success).toBe(true);
    });

    test('returns false if index does not exist', () => {
      const doc = createTypedModel();
      expect(doc.api.read('/arr/1')).toBe(0);
      const success = doc.api.remove('/arr/9999');
      expect(doc.api.read('/arr/1')).toBe(0);
      expect(success).toBe(false);
    });

    test('can remove two elements at once', () => {
      const doc = Model.create(s.arr([s.con(1), s.con(2), s.con(3), s.con(4), s.con(5)]));
      expect(doc.api.read()).toEqual([1, 2, 3, 4, 5]);
      const success = doc.api.remove('/1', 2);
      expect(doc.api.read()).toEqual([1, 4, 5]);
      expect(success).toBe(true);
    });
  });

  describe('"str" node', () => {
    test('can remove text from "str" node', () => {
      const doc = createTypedModel();
      expect(doc.api.read('/obj/str')).toBe('asdf');
      const success = doc.api.remove('/obj/str/1', 2);
      expect(doc.api.read('/obj/str')).toBe('af');
      expect(success).toBe(true);
    });

    test('can remove text from "str" node - 2', () => {
      const doc = createTypedModel();
      expect(doc.api.read('/obj/str')).toBe('asdf');
      const success = doc.api.remove(['obj', 'str', 0]);
      expect(doc.api.read('/obj/str')).toBe('sdf');
      expect(success).toBe(true);
    });
  });

  describe('"bin" node', () => {
    test('can remove bytes from "bin" node', () => {
      const doc = createTypedModel();
      expect(doc.api.read('/bin')).toEqual(new Uint8Array([1, 2, 3]));
      const success = doc.api.remove('/bin/1', 2);
      expect(doc.api.read('/bin')).toEqual(new Uint8Array([1]));
      expect(success).toBe(true);
    });

    test('can remove bytes from "bin" node - 2', () => {
      const doc = createTypedModel();
      expect(doc.api.read('/bin')).toEqual(new Uint8Array([1, 2, 3]));
      const success = doc.api.remove(['bin', 0]);
      expect(doc.api.read('/bin')).toEqual(new Uint8Array([2, 3]));
      expect(success).toBe(true);
    });
  });

  describe('"vec" node', () => {
    test('can remove value from "vec" node', () => {
      const doc = createTypedModel();
      expect(doc.api.read('/vec/0')).toBe('asdf');
      const success = doc.api.remove('/vec/0');
      expect(doc.api.read('/vec/0')).toBe(undefined);
      expect(success).toBe(true);
    });

    test('returns false if index does not exist', () => {
      const doc = createTypedModel();
      expect(doc.api.read('/vec/0')).toBe('asdf');
      const success = doc.api.remove('/vec/9999');
      expect(doc.api.read('/vec/0')).toBe('asdf');
      expect(success).toBe(false);
    });
  });
});
