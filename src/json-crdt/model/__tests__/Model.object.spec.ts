import {Model} from '../Model';

describe('Document', () => {
  describe('object', () => {
    test('can create an array', () => {
      const model = Model.withLogicalClock();
      model.api.set({foo: {bar: 123}});
      expect(model.view()).toEqual({foo: {bar: 123}});
    });

    test('can delete object key', () => {
      const model = Model.withLogicalClock();
      model.api.set({foo: 1, bar: 2, baz: 3});
      model.api.obj([]).del(['bar']);
      expect(model.view()).toEqual({foo: 1, baz: 3});
    });
  });
});
