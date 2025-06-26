import {Model} from '../../Model';

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

  const create = () => {
    const doc = Model.create();
    doc.api.root({
      foo: 'bar',
      obj: {
        nested: {
          value: 42,
          deep: {
            another: 'value',
          },
        },
      },
      arr: [1, 2, {
        nested: [1, 2, 3],
        deep: {
          value: 4
        }
      }],
    });
    return doc;
  };

  test('retrieve deep within document', () => {
    const doc = create();
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
    const doc = create();
    expect(doc.api.read('/asdfasdfasdf')).toBe(undefined);
    expect(doc.api.read('/obj/asdf')).toBe(undefined);
    expect(doc.api.read('/arr/10')).toBe(undefined);
    expect(doc.api.read(['asdfasdfasdf'])).toBe(undefined);
    expect(doc.api.read(['obj', 'asdf'])).toBe(undefined);
    expect(doc.api.read(['arr', 10])).toBe(undefined);
  });
});
