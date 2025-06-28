import {Model} from '../../Model';

describe('.merge()', () => {
  test('can merge changes into an object', () => {
    const doc = Model.create();
    doc.api.set({
      foo: 'bar',
      x: 123,
    });
    doc.api.r.merge({
      foo: 'baz!',
      x: 123,
      y: 'new',
    });
    expect(doc.view()).toEqual({
      foo: 'baz!',
      x: 123,
      y: 'new',
    });
  });
});
