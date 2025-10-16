import {mval} from '..';
import {s} from '../../../json-crdt-patch';
import {Model} from '../../../json-crdt/model';

test('view should preserve identity', () => {
  const model = Model.create(
    s.obj({
      mv: mval.new(1),
    }),
  );
  expect(model.s.mv.$.view()).toBe(model.s.mv.$.view());
});

test('can set new values in single fork', () => {
  const model = Model.create();
  model.ext.register(mval);
  model.api.set({
    mv: mval.new(1),
  });
  expect(model.view()).toEqual({mv: [1]});
  const register = model.api.in(['mv']).asExt(mval);
  register.set(2);
  expect(model.view()).toEqual({mv: [2]});
  register.set(3);
  expect(model.view()).toEqual({mv: [3]});
});

test('removes tombstones on insert', () => {
  const model = Model.create();
  model.ext.register(mval);
  model.api.set({
    mv: mval.new(1),
  });
  const register = model.api.in(['mv']).asExt(mval);
  expect(register.node.data.size()).toBe(1);
  register.set(2);
  expect(register.node.data.size()).toBe(1);
  expect(model.view()).toEqual({mv: [2]});
  register.set(3);
  expect(register.node.data.size()).toBe(1);
  expect(model.view()).toEqual({mv: [3]});
});

test('contains two values when two forks set value concurrently', () => {
  const model1 = Model.create();
  model1.ext.register(mval);
  model1.api.set({
    mv: mval.new(1),
  });
  const model2 = model1.fork();
  const register1 = model1.api.in(['mv']).asExt(mval);
  const register2 = model2.api.in(['mv']).asExt(mval);
  register1.set(2);
  register2.set(3);
  expect(model1.view()).toEqual({mv: [2]});
  expect(model2.view()).toEqual({mv: [3]});
  model1.applyPatch(model2.api.flush());
  expect((model1.view() as any).mv.indexOf(2) >= 0).toBe(true);
  expect((model1.view() as any).mv.indexOf(3) >= 0).toBe(true);
  expect((model2.view() as any).mv.indexOf(2) === -1).toBe(true);
  expect((model2.view() as any).mv.indexOf(3) >= 0).toBe(true);
  model2.applyPatch(model1.api.flush());
  expect((model2.view() as any).mv.indexOf(2) >= 0).toBe(true);
  expect((model2.view() as any).mv.indexOf(3) >= 0).toBe(true);
});

test('contains one value when a fork overwrites a register', () => {
  const model1 = Model.create();
  model1.ext.register(mval);
  model1.api.set({
    mv: mval.new(1),
  });
  const model2 = model1.fork();
  const register1 = model1.api.in(['mv']).asExt(mval);
  const register2 = model2.api.in(['mv']).asExt(mval);
  register1.set(2);
  register2.set(3);
  model1.applyPatch(model2.api.flush());
  expect((model1.view() as any).mv.length).toBe(2);
  register1.set(4);
  expect((model1.view() as any).mv.length).toBe(1);
  expect(model1.view()).toEqual({mv: [4]});
});
