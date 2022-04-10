import {Model} from '../Model';

describe('Document', () => {
  describe('object', () => {
    test('can create an array', () => {
      const model = Model.withLogicalClock();
      model.api.root({foo: {bar: 123}}).commit();
      expect(model.toView()).toEqual({foo: {bar: 123}});
    });

    test('can delete object key', () => {
      const model = Model.withLogicalClock();
      model.api.root({foo: 1, bar: 2, baz: 3}).commit();
      model.api.obj([]).del(['bar']).commit();
      expect(model.toView()).toEqual({foo: 1, baz: 3});
    });
  });
});
