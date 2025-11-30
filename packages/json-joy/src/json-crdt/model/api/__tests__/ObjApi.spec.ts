import {Model} from '../../Model';

describe('merge', () => {
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
});
