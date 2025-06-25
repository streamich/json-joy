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

  test('retrieve deep within document', () => {
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
    expect(doc.api.r.read('/foo')).toEqual('bar');
    expect(doc.api.read('/foo')).toEqual('bar');
    expect((doc.s as any).foo.toView()).toEqual('bar');
  });
});
