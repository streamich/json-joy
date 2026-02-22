import {Model} from '../../Model';

test('can silently return `undefined` on missing node', () => {
  const doc = Model.create({a: {}, b: 123});
  const api = doc.api;
  api.obj('/a');
  api.obj('/a', true);
  expect(() => api.obj('/b')).toThrow();
  api.obj('/b', true);
  expect(() => api.obj('/c')).toThrow();
  api.obj('/c', true);
});

describe('.merge()', () => {
  test('can subscribe and un-subscribe to "view" events', async () => {
    const doc = Model.create({
      obj: {
        foo: new Uint8Array([1, 2, 3]),
        bar: '123',
      },
    });
    const api = doc.api;
    const obj = api.obj(['obj']);
    obj.merge({
      foo: new Uint8Array([4, 5, 6]),
      baz: 'new',
    });
    expect(obj.view()).toEqual({
      foo: new Uint8Array([4, 5, 6]),
      baz: 'new',
    });
  });
});

describe('.mergeKeys()', () => {
  test('can merge specific key', async () => {
    const doc = Model.create({
      obj: {
        foo: new Uint8Array([1, 2, 3]),
        bar: '123',
      },
    });
    const api = doc.api;
    const obj = api.obj(['obj']);
    obj.get('foo').merge(new Uint8Array([4, 5, 6]));
    expect(obj.view()).toEqual({
      foo: new Uint8Array([4, 5, 6]),
      bar: '123',
    });
    obj.mergeKeys({foo: {aha: 123}});
    expect(obj.view()).toEqual({
      foo: {aha: 123},
      bar: '123',
    });
    obj.mergeKeys({foo: '123', x: 'y', bar: '1234'});
    expect(obj.view()).toEqual({
      foo: '123',
      bar: '1234',
      x: 'y',
    });
  });

  test('"str" key overwritten by "bin"', async () => {
    const doc = Model.create({
      obj: {
        foo: 'asdf',
        bar: 123,
      },
    });
    const api = doc.api;
    const obj = api.obj(['obj']);
    obj.mergeKeys({foo: new Uint8Array([1, 2, 3])});
    expect(obj.view()).toEqual({
      foo: new Uint8Array([1, 2, 3]),
      bar: 123,
    });
  });

  test('"obj" key overwritten by "bin"', async () => {
    const doc = Model.create({
      obj: {
        foo: {a: 1, b: 2},
        bar: 123,
      },
    });
    const api = doc.api;
    const obj = api.obj(['obj']);
    obj.mergeKeys({foo: new Uint8Array([1, 2, 3])});
    expect(obj.view()).toEqual({
      foo: new Uint8Array([1, 2, 3]),
      bar: 123,
    });
  });

  test('"bin" key overwritten by "obj"', async () => {
    const doc = Model.create({
      obj: {
        foo: new Uint8Array([1, 2, 3]),
        bar: 123,
      },
    });
    const api = doc.api;
    const obj = api.obj(['obj']);
    obj.mergeKeys({foo: {a: 1, b: 2}});
    expect(obj.view()).toEqual({
      foo: {a: 1, b: 2},
      bar: 123,
    });
  });

  test('"bin" key overwritten by "bin"', async () => {
    const doc = Model.create({
      obj: {
        foo: new Uint8Array([1, 2, 3]),
        bar: 123,
      },
    });
    const api = doc.api;
    const obj = api.obj(['obj']);
    const fooId = api.bin(['obj', 'foo']).node.id;
    obj.mergeKeys({foo: new Uint8Array([3, 4, 5, 6])});
    const fooId2 = api.bin(['obj', 'foo']).node.id;
    expect(obj.view()).toEqual({
      foo: new Uint8Array([3, 4, 5, 6]),
      bar: 123,
    });
    expect(fooId).toBe(fooId2);
  });

  test('"str" key overwritten by "str"', async () => {
    const doc = Model.create({
      obj: {
        foo: 'asdf',
        bar: 123,
      },
    });
    const api = doc.api;
    const obj = api.obj(['obj']);
    const fooId = api.str(['obj', 'foo']).node.id;
    obj.mergeKeys({foo: 'Asdf!'});
    const fooId2 = api.str(['obj', 'foo']).node.id;
    expect(obj.view()).toEqual({
      foo: 'Asdf!',
      bar: 123,
    });
    expect(fooId).toBe(fooId2);
  });
});
