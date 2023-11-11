import {Model, ModelChangeType} from '../Model';

describe('DOM Level 0, .onchange event system', () => {
  it('should trigger the onchange event when a value is set', () => {
    const model = Model.withLogicalClock();
    let cnt = 0;
    model.onchange = () => {
      cnt++;
    };
    expect(cnt).toBe(0);
    model.api.root({foo: 'bar'});
    expect(cnt).toBe(1);
    model.api.obj([]).set({hello: 123});
    expect(cnt).toBe(2);
    expect(model.view()).toStrictEqual({
      foo: 'bar',
      hello: 123,
    });
  });

  it('should trigger the onchange event when a value is set to the same value', () => {
    const model = Model.withLogicalClock();
    let cnt = 0;
    model.onchange = () => {
      cnt++;
    };
    expect(cnt).toBe(0);
    model.api.root({foo: 123});
    expect(cnt).toBe(1);
    model.api.obj([]).set({foo: 123});
    expect(cnt).toBe(2);
  });

  it('should trigger the onchange event when a value is deleted', () => {
    const model = Model.withLogicalClock();
    let cnt = 0;
    model.onchange = () => {
      cnt++;
    };
    expect(cnt).toBe(0);
    model.api.root({foo: 123});
    expect(cnt).toBe(1);
    model.api.obj([]).set({foo: undefined});
    expect(cnt).toBe(2);
    expect(model.view()).toStrictEqual({});
  });

  it('should trigger the onchange event when a non-existent value is deleted', () => {
    const model = Model.withLogicalClock();
    let cnt = 0;
    model.onchange = () => {
      cnt++;
    };
    expect(cnt).toBe(0);
    model.api.root({foo: 123});
    expect(cnt).toBe(1);
    model.api.obj([]).set({bar: undefined});
    expect(cnt).toBe(2);
    expect(model.view()).toStrictEqual({foo: 123});
  });

  it('should trigger when root value is changed', () => {
    const model = Model.withLogicalClock();
    let cnt = 0;
    model.onchange = () => {
      cnt++;
    };
    expect(cnt).toBe(0);
    model.api.root({foo: 123});
    expect(cnt).toBe(1);
    model.api.root(123);
    expect(cnt).toBe(2);
    model.api.root('asdf');
    expect(cnt).toBe(3);
  });

  describe('event types', () => {
    it('should trigger the onchange event with a LOCAL event type', () => {
      const model = Model.withLogicalClock();
      let cnt = 0;
      model.onchange = (type) => {
        expect(type).toBe(ModelChangeType.LOCAL);
        cnt++;
      };
      expect(cnt).toBe(0);
      model.api.root({foo: 123});
      expect(cnt).toBe(1);
      model.api.obj([]).set({foo: 55});
      expect(cnt).toBe(2);
      expect(model.view()).toStrictEqual({foo: 55});
    });

    it('should trigger the onchange event with a REMOTE event type', () => {
      const model = Model.withLogicalClock();
      let cnt = 0;
      model.onchange = (type) => {
        expect(type).toBe(ModelChangeType.REMOTE);
        cnt++;
      };
      const builder = model.api.builder;
      builder.root(builder.json({foo: 123}));
      const patch = builder.flush();
      expect(cnt).toBe(0);
      model.applyPatch(patch);
      expect(cnt).toBe(1);
      expect(model.view()).toStrictEqual({foo: 123});
    });

    it('should trigger the onchange event with a RESET event type', () => {
      const model1 = Model.withLogicalClock();
      const model2 = Model.withLogicalClock();
      model2.api.root([1, 2, 3]);
      let cnt = 0;
      model1.onchange = (type) => {
        expect(type).toBe(ModelChangeType.RESET);
        cnt++;
      };
      expect(cnt).toBe(0);
      model1.reset(model2);
      expect(cnt).toBe(1);
      expect(model1.view()).toStrictEqual([1, 2, 3]);
    });
  });
});
