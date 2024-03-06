import {ValueMvExt} from '../../../../json-crdt-extensions/mval';
import {konst} from '../../../../json-crdt-patch/builder/Konst';
import {Model} from '../../../../json-crdt/model';

test('can specify extension name', () => {
  expect(ValueMvExt.name).toBe('mval');
});

test('can create a new multi-value register', () => {
  const model = Model.withLogicalClock();
  model.ext.register(ValueMvExt);
  model.api.root({
    mv: ValueMvExt.new(),
  });
  expect(model.view()).toEqual({
    mv: [],
  });
});

test('can provide initial value', () => {
  const model = Model.withLogicalClock();
  model.ext.register(ValueMvExt);
  model.api.root({
    mv: ValueMvExt.new({foo: 'bar'}),
  });
  expect(model.view()).toEqual({
    mv: [{foo: 'bar'}],
  });
});

test('can read view from node or API node', () => {
  const model = Model.withLogicalClock();
  model.ext.register(ValueMvExt);
  model.api.root({
    mv: ValueMvExt.new('foo'),
  });
  const api = model.api.in('mv').asExt(ValueMvExt);
  expect(api.view()).toEqual(['foo']);
  expect(api.node.view()).toEqual(['foo']);
});

test('exposes API to edit extension data', () => {
  const model = Model.withLogicalClock();
  model.ext.register(ValueMvExt);
  model.api.root({
    mv: ValueMvExt.new(),
  });
  const nodeApi = model.api.in('mv').asExt(ValueMvExt);
  nodeApi.set(konst('lol'));
  expect(model.view()).toEqual({
    mv: ['lol'],
  });
});

describe('extension validity checks', () => {
  test('does not treat ArrNode as extension if header is too long', () => {
    const model = Model.withLogicalClock();
    model.ext.register(ValueMvExt);
    model.api.root({
      mv: ValueMvExt.new(),
    });
    const buf = new Uint8Array(4);
    buf.set(model.api.const(['mv', 0]).node.view() as Uint8Array, 0);
    model.api.vec(['mv']).set([[0, buf]]);
    expect(model.view()).toEqual({
      mv: [buf, []],
    });
    expect(model.api.vec(['mv']).node.isExt()).toBe(false);
  });
  
  test('does not treat ArrNode as extension if header sid is wrong', () => {
    const model = Model.withLogicalClock();
    model.ext.register(ValueMvExt);
    model.api.root({
      mv: ValueMvExt.new(),
    });
    const buf = model.api.const(['mv', 0]).node.view() as Uint8Array;
    buf[1] += 1;
    expect(model.view()).toEqual({
      mv: [buf, []],
    });
    expect(model.api.vec(['mv']).node.isExt()).toBe(false);
  });
  
  test('does not treat ArrNode as extension if header time is wrong', () => {
    const model = Model.withLogicalClock();
    model.ext.register(ValueMvExt);
    model.api.root({
      mv: ValueMvExt.new(),
    });
    const buf = model.api.const(['mv', 0]).node.view() as Uint8Array;
    buf[2] += 1;
    expect(model.view()).toEqual({
      mv: [buf, []],
    });
    expect(model.api.vec(['mv']).node.isExt()).toBe(false);
  });
});
