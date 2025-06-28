import {mval} from '../../../../json-crdt-extensions/mval';
import {konst} from '../../../../json-crdt-patch/builder/Konst';
import {Model} from '../../../../json-crdt/model';

test('can specify extension name', () => {
  expect(mval.name).toBe('mval');
});

test('can create a new multi-value register', () => {
  const model = Model.withLogicalClock();
  model.ext.register(mval);
  model.api.set({
    mv: mval.new(),
  });
  expect(model.view()).toEqual({
    mv: [],
  });
});

test('can provide initial value', () => {
  const model = Model.withLogicalClock();
  model.ext.register(mval);
  model.api.set({
    mv: mval.new({foo: 'bar'}),
  });
  expect(model.view()).toEqual({
    mv: [{foo: 'bar'}],
  });
});

test('can read view from node or API node', () => {
  const model = Model.withLogicalClock();
  model.ext.register(mval);
  model.api.set({
    mv: mval.new('foo'),
  });
  const api = model.api.in('mv').asExt()!;
  expect(api.view()).toEqual(['foo']);
  expect(api.node.view()).toEqual(['foo']);
});

test('exposes API to edit extension data', () => {
  const model = Model.withLogicalClock();
  model.ext.register(mval);
  model.api.set({
    mv: mval.new(),
  });
  const nodeApi = model.api.in('mv').asExt(mval);
  nodeApi.set(konst('lol'));
  expect(model.view()).toEqual({
    mv: ['lol'],
  });
});

describe('extension validity checks', () => {
  test('does not treat VecNode as extension if header is too long', () => {
    const model = Model.withLogicalClock();
    model.ext.register(mval);
    model.api.set({
      mv: mval.new(),
    });
    const buf = new Uint8Array(4);
    buf.set(model.api.con(['mv', 0]).node.view() as Uint8Array, 0);
    const api = model.api.vec(['mv']);
    api.set([[0, buf]]);
    expect(model.view()).toEqual({
      mv: [buf, []],
    });
    expect(model.api.vec(['mv']).node.isExt()).toBe(false);
  });

  test('does not treat VecNode as extension if header sid is wrong', () => {
    const model = Model.withLogicalClock();
    model.ext.register(mval);
    model.api.set({
      mv: mval.new(),
    });
    const buf = model.api.con(['mv', 0]).node.view() as Uint8Array;
    buf[1] += 1;
    expect(model.view()).toEqual({
      mv: [buf, []],
    });
    expect(model.api.vec(['mv']).node.isExt()).toBe(false);
  });

  test('does not treat VecNode as extension if header time is wrong', () => {
    const model = Model.withLogicalClock();
    model.ext.register(mval);
    model.api.set({
      mv: mval.new(),
    });
    const buf = model.api.con(['mv', 0]).node.view() as Uint8Array;
    buf[2] += 1;
    expect(model.view()).toEqual({
      mv: [buf, []],
    });
    expect(model.api.vec(['mv']).node.isExt()).toBe(false);
  });
});
