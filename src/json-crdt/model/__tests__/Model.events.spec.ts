import {PatchBuilder} from '../../../json-crdt-patch';
import {Model} from '../Model';

describe('DOM Level 0, .onchange event system', () => {
  it('should trigger the onchange event when a value is set', () => {
    const model = Model.create();
    let cnt = 0;
    model.onpatch = () => {
      cnt++;
    };
    expect(cnt).toBe(0);
    const builder = new PatchBuilder(model.clock.clone());
    const objId = builder.json({foo: 123});
    builder.root(objId);
    model.applyPatch(builder.flush());
    expect(cnt).toBe(1);
    builder.insObj(objId, [['hello', builder.con(456)]]);
    model.applyPatch(builder.flush());
    expect(cnt).toBe(2);
    expect(model.view()).toStrictEqual({
      foo: 123,
      hello: 456,
    });
  });

  it('should trigger the onchange event when a value is set to the same value', () => {
    const model = Model.create();
    let cnt = 0;
    model.onpatch = () => {
      cnt++;
    };
    expect(cnt).toBe(0);
    const builder = new PatchBuilder(model.clock.clone());
    builder.root(builder.json({foo: 123}));
    model.applyPatch(builder.flush());
    expect(cnt).toBe(1);
    builder.root(builder.json({foo: 123}));
    model.applyPatch(builder.flush());
    expect(cnt).toBe(2);
  });

  it('should trigger the onchange event when a value is deleted', () => {
    const model = Model.create();
    let cnt = 0;
    model.onpatch = () => {
      cnt++;
    };
    expect(cnt).toBe(0);
    const builder = new PatchBuilder(model.clock.clone());
    const objId = builder.json({foo: 123});
    builder.root(objId);
    model.applyPatch(builder.flush());
    expect(cnt).toBe(1);
    builder.insObj(objId, [['foo', builder.con(undefined)]]);
    model.applyPatch(builder.flush());
    expect(cnt).toBe(2);
    expect(model.view()).toStrictEqual({});
  });

  it('should trigger the onchange event when a non-existent value is deleted', () => {
    const model = Model.create();
    let cnt = 0;
    model.onpatch = () => {
      cnt++;
    };
    expect(cnt).toBe(0);
    const builder = new PatchBuilder(model.clock.clone());
    const objId = builder.json({foo: 123});
    builder.root(objId);
    model.applyPatch(builder.flush());
    expect(cnt).toBe(1);
    builder.insObj(objId, [['bar', builder.con(undefined)]]);
    model.applyPatch(builder.flush());
    expect(cnt).toBe(2);
    expect(model.view()).toStrictEqual({foo: 123});
  });

  it('should trigger when root value is changed', () => {
    const model = Model.create();
    let cnt = 0;
    model.onpatch = () => {
      cnt++;
    };
    expect(cnt).toBe(0);
    const builder = new PatchBuilder(model.clock.clone());
    const objId = builder.json({foo: 123});
    builder.root(objId);
    model.applyPatch(builder.flush());
    expect(cnt).toBe(1);
    builder.root(builder.json(123));
    model.applyPatch(builder.flush());
    expect(cnt).toBe(2);
    builder.root(builder.json('asdf'));
    model.applyPatch(builder.flush());
    expect(cnt).toBe(3);
  });

  describe('event types', () => {
    it('should trigger the onchange event with a RESET event type', () => {
      const model1 = Model.create();
      const model2 = Model.create();
      model2.api.set([1, 2, 3]);
      let cnt = 0;
      model1.onreset = () => {
        cnt++;
      };
      expect(cnt).toBe(0);
      model1.reset(model2);
      expect(cnt).toBe(1);
      expect(model1.view()).toStrictEqual([1, 2, 3]);
    });
  });
});
