import {Model} from '../../Model';
import {createTypedModel, createUntypedModel} from './fixtures';

describe('.read()', () => {
  test('can retrieve own view', () => {
    const doc = Model.create();
    doc.api.root({
      arr: [1, 2, 3],
    });
    const arr = doc.api.arr(['arr']);
    expect(arr.read()).toEqual([1, 2, 3]);
    expect(arr.read('')).toEqual([1, 2, 3]);
    expect(arr.read([])).toEqual([1, 2, 3]);
  });

  test('can retrieve array element', () => {
    const doc = Model.create();
    doc.api.root({
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
    expect(doc.api.r.read('/foo')).toEqual('bar');
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
      const success1 = doc.api.add('/str/0', 1);
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
  });
});
