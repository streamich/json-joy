import {deepEqual} from '@jsonjoy.com/util/lib/json-equal/deepEqual';
import {type DelOp, type InsStrOp, s} from '../../../json-crdt-patch';
import {Model} from '../../model';
import {Log} from '../Log';

const setup = (view: unknown) => {
  const model = Model.withServerClock();
  model.api.set(view);
  const log = Log.fromNewModel(model);
  return {log};
};

test('can create a new log from a new model with right starting logical clock', () => {
  const schema0 = s.obj({
    id: s.con<string>(''),
    name: s.str('John Doe'),
    age: s.val(s.con<number>(42)),
    tags: s.arr([s.str('tag1'), s.str('tag2')]),
  });
  const model = Model.create(schema0);
  const sid = model.clock.sid;
  const log = Log.fromNewModel(model);
  log.end.s.$.set({id: s.con('xyz') as any});
  log.end.api.flush();
  log.end.s.age.$.set(35);
  log.end.api.flush();
  log.end.s.tags.$.del(0, 1);
  log.end.api.flush();
  log.end.s.name.$.del(0, 8);
  log.end.s.name.$.ins(0, 'Va Da');
  log.end.api.flush();
  log.end.s.tags[0].$.del(0, 4);
  log.end.s.tags[0].$.ins(0, 'happy');
  log.end.api.flush();
  expect(log.start().clock.sid).toBe(sid);
  expect(log.start().clock.time).toBe(1);
  expect(log.end.clock.sid).toBe(sid);
  expect(log.end.clock.time > 10).toBe(true);
});

describe('.replayTo()', () => {
  test('can replay to specific patch', () => {
    const {log} = setup({foo: 'bar'});
    const model = log.end.clone();
    model.api.obj([]).set({x: 1});
    const patch1 = model.api.flush();
    model.api.obj([]).set({y: 2});
    const patch2 = model.api.flush();
    log.end.applyPatch(patch1);
    log.end.applyPatch(patch2);
    const model2 = log.replayToEnd();
    const model3 = log.replayTo(patch1.getId()!);
    const model4 = log.replayTo(patch2.getId()!);
    expect(model.view()).toEqual({foo: 'bar', x: 1, y: 2});
    expect(log.end.view()).toEqual({foo: 'bar', x: 1, y: 2});
    expect(log.start().view()).toEqual(undefined);
    expect(model2.view()).toEqual({foo: 'bar', x: 1, y: 2});
    expect(model3.view()).toEqual({foo: 'bar', x: 1});
    expect(model4.view()).toEqual({foo: 'bar', x: 1, y: 2});
  });

  test('can replay to just before a specific patch', () => {
    const {log} = setup({foo: 'bar'});
    const model = log.end.clone();
    model.api.obj([]).set({x: 1});
    const patch1 = model.api.flush();
    model.api.obj([]).set({y: 2});
    const patch2 = model.api.flush();
    log.end.applyPatch(patch1);
    log.end.applyPatch(patch2);
    const model2 = log.replayToEnd();
    const model3 = log.replayTo(patch1.getId()!, false);
    const model4 = log.replayTo(patch2.getId()!, false);
    expect(model.view()).toEqual({foo: 'bar', x: 1, y: 2});
    expect(log.end.view()).toEqual({foo: 'bar', x: 1, y: 2});
    expect(log.start().view()).toEqual(undefined);
    expect(model2.view()).toEqual({foo: 'bar', x: 1, y: 2});
    expect(model3.view()).toEqual({foo: 'bar'});
    expect(model4.view()).toEqual({foo: 'bar', x: 1});
  });
});

describe('.advanceTo()', () => {
  test('can advance the log from start', () => {
    const {log} = setup({foo: 'bar'});
    log.end.api.obj([]).set({x: 1});
    const patch1 = log.end.api.flush();
    log.end.api.obj([]).set({y: 2});
    const patch2 = log.end.api.flush();
    log.end.api.obj([]).set({foo: 'baz'});
    const patch3 = log.end.api.flush();
    expect(log.end.view()).toEqual({foo: 'baz', x: 1, y: 2});
    expect(log.start().view()).toEqual(undefined);
    log.advanceTo(patch1.getId()!);
    expect(log.end.view()).toEqual({foo: 'baz', x: 1, y: 2});
    expect(log.start().view()).toEqual({foo: 'bar', x: 1});
    log.advanceTo(patch2.getId()!);
    expect(log.end.view()).toEqual({foo: 'baz', x: 1, y: 2});
    expect(log.start().view()).toEqual({foo: 'bar', x: 1, y: 2});
    expect(log.patches.size()).toBe(1);
    log.advanceTo(patch3.getId()!);
    expect(log.end.view()).toEqual({foo: 'baz', x: 1, y: 2});
    expect(log.start().view()).toEqual({foo: 'baz', x: 1, y: 2});
    expect(log.patches.size()).toBe(0);
  });

  test('can advance multiple patches at once', () => {
    const {log} = setup({foo: 'bar'});
    log.end.api.obj([]).set({x: 1});
    log.end.api.flush();
    log.end.api.obj([]).set({y: 2});
    const patch2 = log.end.api.flush();
    log.end.api.obj([]).set({foo: 'baz'});
    log.end.api.flush();
    expect(log.end.view()).toEqual({foo: 'baz', x: 1, y: 2});
    expect(log.start().view()).toEqual(undefined);
    log.advanceTo(patch2.getId()!);
    expect(log.end.view()).toEqual({foo: 'baz', x: 1, y: 2});
    expect(log.start().view()).toEqual({foo: 'bar', x: 1, y: 2});
  });
});

describe('.findMax()', () => {
  test('can advance the log from start', () => {
    const model = Model.create();
    const sid0 = model.clock.sid;
    const sid1 = Model.sid();
    model.api.set({foo: 'bar'});
    const log = Log.fromNewModel(model);
    log.end.api.obj([]).set({x: 1});
    const patch1 = log.end.api.flush();
    log.end.setSid(sid1);
    log.end.api.obj([]).set({y: 2});
    const patch2 = log.end.api.flush();
    log.end.setSid(sid0);
    log.end.api.obj([]).set({foo: 'baz'});
    const patch3 = log.end.api.flush();
    const found0 = log.findMax(sid0);
    const found1 = log.findMax(sid1);
    const found2 = log.findMax(12345);
    expect(found0).toBe(patch3);
    expect(found1).toBe(patch2);
    expect(found2).toBe(void 0);
  });
});

const setupTwoLogs = () => {
  const model = Model.create({foo: 'bar'});
  const log1 = Log.fromNewModel(model);
  log1.metadata = {time: 123};
  log1.end.api.obj([]).set({x: 1});
  log1.end.api.flush();
  log1.end.api.obj([]).set({y: 2});
  log1.end.api.flush();
  log1.end.api.obj([]).set({foo: 'baz'});
  log1.end.api.flush();
  const log2 = log1.clone();
  return {log1, log2};
};

const assertLogsEqual = (log1: Log<any, any>, log2: Log<any, any>) => {
  expect(log1.start()).not.toBe(log2.start());
  expect(deepEqual(log1.start().view(), log2.start().view())).toBe(true);
  expect(log1.start().clock.sid).toEqual(log2.start().clock.sid);
  expect(log1.start().clock.time).toEqual(log2.start().clock.time);
  expect(log1.end).not.toBe(log2.end);
  expect(deepEqual(log1.end.view(), log2.end.view())).toBe(true);
  expect(log1.end.clock.sid).toEqual(log2.end.clock.sid);
  expect(log1.end.clock.time).toEqual(log2.end.clock.time);
  expect(log1.metadata).not.toBe(log2.metadata);
  expect(deepEqual(log1.metadata, log2.metadata)).toBe(true);
  expect(log1.patches.size()).toBe(log2.patches.size());
  expect(log1.patches.min!.v.toBinary()).toEqual(log2.patches.min!.v.toBinary());
  expect(log1.patches.max!.v.toBinary()).toEqual(log2.patches.max!.v.toBinary());
  expect(log1.patches.min!.v).not.toBe(log2.patches.min!.v);
  expect(log1.patches.max!.v).not.toBe(log2.patches.max!.v);
};

describe('.clone()', () => {
  test('start model has the same view and clock', () => {
    const {log1, log2} = setupTwoLogs();
    expect(log1.start()).not.toBe(log2.start());
    expect(deepEqual(log1.start().view(), log2.start().view())).toBe(true);
    expect(log1.start().clock.sid).toEqual(log2.start().clock.sid);
    expect(log1.start().clock.time).toEqual(log2.start().clock.time);
  });

  test('end model has the same view and clock', () => {
    const {log1, log2} = setupTwoLogs();
    expect(log1.end).not.toBe(log2.end);
    expect(deepEqual(log1.end.view(), log2.end.view())).toBe(true);
    expect(log1.end.clock.sid).toEqual(log2.end.clock.sid);
    expect(log1.end.clock.time).toEqual(log2.end.clock.time);
  });

  test('metadata is the same but has different identity', () => {
    const {log1, log2} = setupTwoLogs();
    expect(log1.metadata).not.toBe(log2.metadata);
    expect(deepEqual(log1.metadata, log2.metadata)).toBe(true);
  });

  test('patch log is the same', () => {
    const {log1, log2} = setupTwoLogs();
    expect(log1.patches.size()).toBe(log2.patches.size());
    expect(log1.patches.min!.v.toBinary()).toEqual(log2.patches.min!.v.toBinary());
    expect(log1.patches.max!.v.toBinary()).toEqual(log2.patches.max!.v.toBinary());
    expect(log1.patches.min!.v).not.toBe(log2.patches.min!.v);
    expect(log1.patches.max!.v).not.toBe(log2.patches.max!.v);
  });

  test('can evolve logs independently', () => {
    const {log1, log2} = setupTwoLogs();
    assertLogsEqual(log1, log2);
    log1.end.api.obj([]).set({a: 1});
    log1.end.api.flush();
    expect(log1.end.view()).toEqual({foo: 'baz', x: 1, y: 2, a: 1});
    expect(log2.end.view()).toEqual({foo: 'baz', x: 1, y: 2});
    log2.end.api.obj([]).set({b: 2});
    log2.end.api.flush();
    expect(log1.end.view()).toEqual({foo: 'baz', x: 1, y: 2, a: 1});
    expect(log2.end.view()).toEqual({foo: 'baz', x: 1, y: 2, b: 2});
  });
});

describe('.rebaseBatch()', () => {
  test('can rebase a concurrent batch onto another log', () => {
    const {log1, log2} = setupTwoLogs();
    log1.end.api.obj([]).set({a: 1});
    log2.end.api.obj([]).set({b: 2});
    const patch1 = log1.end.api.flush();
    const patch2 = log2.end.api.flush();
    expect(patch1.toBinary()).not.toEqual(patch2.toBinary());
    expect(patch1.getId()?.sid).toBe(patch2.getId()?.sid);
    expect(patch1.getId()?.time).toBe(patch2.getId()?.time);
    expect(patch1.span()).toEqual(patch2.span());
    const [patch3] = log1.rebaseBatch([patch2]);
    expect(patch1.toBinary()).not.toEqual(patch3.toBinary());
    expect(patch1.getId()?.sid).toBe(patch3.getId()?.sid);
    expect(patch1.getId()!.time + patch1.span()).toBe(patch3.getId()?.time);
    log1.end.applyPatch(patch3);
    expect(log1.end.view()).toEqual({foo: 'baz', x: 1, y: 2, a: 1, b: 2});
    expect(log2.end.view()).toEqual({foo: 'baz', x: 1, y: 2, b: 2});
    expect(() => assertLogsEqual(log1, log2)).toThrow();
    log2.reset(log1.clone());
    assertLogsEqual(log1, log2);
  });

  test('can rebase a concurrent batch onto another log (multiple patches)', () => {
    const {log1, log2} = setupTwoLogs();
    log1.end.api.obj([]).set({a: 1});
    log2.end.api.obj([]).set({b: 2});
    log1.end.api.flush();
    const patch2 = log2.end.api.flush();
    log1.end.api.obj([]).set({a: 2});
    log2.end.api.obj([]).set({b: 3});
    log1.end.api.flush();
    const patch4 = log2.end.api.flush();
    log2.end.api.obj([]).set({b: 3});
    const patch5 = log2.end.api.flush();
    const batch2 = [patch2, patch4, patch5];
    expect(log1.end.view()).toEqual({foo: 'baz', x: 1, y: 2, a: 2});
    expect(log2.end.view()).toEqual({foo: 'baz', x: 1, y: 2, b: 3});
    const batch3 = log1.rebaseBatch(batch2);
    expect(batch3[0].getId()!.time).toBe(log1.end.clock.time);
    log1.end.applyBatch(batch3);
    expect(log1.end.view()).toEqual({foo: 'baz', x: 1, y: 2, a: 2, b: 3});
    expect(log2.end.view()).toEqual({foo: 'baz', x: 1, y: 2, b: 3});
    expect(() => assertLogsEqual(log1, log2)).toThrow();
    log2.reset(log1.clone());
    assertLogsEqual(log1, log2);
  });

  test('can specify rebase sid', () => {
    const {log1, log2} = setupTwoLogs();
    expect(log1.end.clock.sid).toBe(log2.end.clock.sid);
    log1.end.api.obj([]).set({a: 1});
    log2.end.api.obj([]).set({b: 2});
    log1.end.api.flush();
    const patch2 = log2.end.api.flush();
    log1.end.setSid(12345);
    log1.end.api.obj([]).set({a: 2});
    log2.end.api.obj([]).set({b: 3});
    log1.end.api.flush();
    const patch4 = log2.end.api.flush();
    log2.end.api.obj([]).set({b: 3});
    const patch5 = log2.end.api.flush();
    const batch2 = [patch2, patch4, patch5];
    expect(log1.end.view()).toEqual({foo: 'baz', x: 1, y: 2, a: 2});
    expect(log2.end.view()).toEqual({foo: 'baz', x: 1, y: 2, b: 3});
    const batch3 = log1.rebaseBatch(batch2, log2.end.clock.sid);
    expect(batch3[0].getId()!.time).not.toBe(log1.end.clock.time);
    log1.end.applyBatch(batch3);
    expect(log1.end.view()).toEqual({foo: 'baz', x: 1, y: 2, a: 2, b: 3});
    expect(log2.end.view()).toEqual({foo: 'baz', x: 1, y: 2, b: 3});
    expect(() => assertLogsEqual(log1, log2)).toThrow();
    log2.reset(log1.clone());
    assertLogsEqual(log1, log2);
  });
});

describe('.undo()', () => {
  describe('RGA', () => {
    describe('str', () => {
      test('can undo string insert', () => {
        const {log} = setup({str: ''});
        log.end.api.flush();
        log.end.api.str(['str']).ins(0, 'a');
        const patch = log.end.api.flush();
        expect(patch.ops.length).toBe(1);
        expect(patch.ops[0].name()).toBe('ins_str');
        const undo = log.undo(patch);
        expect(undo.ops.length).toBe(1);
        expect(undo.ops[0].name()).toBe('del');
        const del = undo.ops[0] as DelOp;
        expect(del.what.length).toBe(1);
        expect(del.what[0].sid).toBe(patch.ops[0].id.sid);
        expect(del.what[0].time).toBe(patch.ops[0].id.time);
        expect(del.what[0].span).toBe(1);
        expect(log.end.view()).toEqual({str: 'a'});
        log.end.applyPatch(undo);
        expect(log.end.view()).toEqual({str: ''});
      });

      test('can undo string delete', () => {
        const {log} = setup({str: 'a'});
        log.end.api.flush();
        log.end.api.str(['str']).del(0, 1);
        const patch = log.end.api.flush();
        expect(patch.ops.length).toBe(1);
        expect(patch.ops[0].name()).toBe('del');
        const undo = log.undo(patch);
        expect(undo.ops.length).toBe(1);
        expect(undo.ops[0].name()).toBe('ins_str');
        const op = undo.ops[0] as InsStrOp;
        expect(op.data).toBe('a');
        expect(op.obj.time).toBe(log.end.api.str(['str']).node.id.time);
        expect(op.obj.sid).toBe(log.end.api.str(['str']).node.id.sid);
        expect(op.ref.time).toBe(log.end.api.str(['str']).node.id.time);
        expect(op.ref.sid).toBe(log.end.api.str(['str']).node.id.sid);
        expect(log.end.view()).toEqual({str: ''});
        log.end.applyPatch(undo);
        expect(log.end.view()).toEqual({str: 'a'});
      });

      test('can undo string delete - 2', () => {
        const {log} = setup({str: '12345'});
        log.end.api.flush();
        log.end.api.str(['str']).del(1, 1);
        const patch1 = log.end.api.flush();
        log.end.api.str(['str']).del(1, 2);
        const patch2 = log.end.api.flush();
        const undo2 = log.undo(patch2);
        const undo1 = log.undo(patch1);
        expect(log.end.view()).toEqual({str: '15'});
        log.end.applyPatch(undo2);
        expect(log.end.view()).toEqual({str: '1345'});
        log.end.applyPatch(undo1);
        expect(log.end.view()).toEqual({str: '12345'});
      });
    });

    describe('bin', () => {
      test('can undo blob insert', () => {
        const {log} = setup({bin: new Uint8Array()});
        log.end.api.flush();
        log.end.api.bin(['bin']).ins(0, new Uint8Array([1, 2, 3]));
        const patch = log.end.api.flush();
        expect(patch.ops.length).toBe(1);
        expect(patch.ops[0].name()).toBe('ins_bin');
        const undo = log.undo(patch);
        expect(undo.ops.length).toBe(1);
        expect(undo.ops[0].name()).toBe('del');
        const del = undo.ops[0] as DelOp;
        expect(del.what.length).toBe(1);
        expect(del.what[0].sid).toBe(patch.ops[0].id.sid);
        expect(del.what[0].time).toBe(patch.ops[0].id.time);
        expect(del.what[0].span).toBe(3);
        expect(log.end.view()).toEqual({bin: new Uint8Array([1, 2, 3])});
        log.end.applyPatch(undo);
        expect(log.end.view()).toEqual({bin: new Uint8Array([])});
      });

      test('can undo blob delete', () => {
        const {log} = setup({bin: new Uint8Array([1, 2, 3])});
        log.end.api.flush();
        log.end.api.bin(['bin']).del(1, 1);
        const patch = log.end.api.flush();
        const undo = log.undo(patch);
        expect(log.end.view()).toEqual({bin: new Uint8Array([1, 3])});
        log.end.applyPatch(undo);
        expect(log.end.view()).toEqual({bin: new Uint8Array([1, 2, 3])});
      });
    });

    describe('arr', () => {
      test('can undo array insert', () => {
        const {log} = setup({arr: []});
        log.end.api.flush();
        log.end.api.arr(['arr']).ins(0, [s.con(1)]);
        const patch = log.end.api.flush();
        expect(patch.ops.length).toBe(2);
        const insOp = patch.ops.find((op) => op.name() === 'ins_arr')!;
        expect(log.end.view()).toEqual({arr: [1]});
        const undo = log.undo(patch);
        expect(undo.ops.length).toBe(1);
        expect(undo.ops[0].name()).toBe('del');
        const del = undo.ops[0] as DelOp;
        expect(del.what.length).toBe(1);
        expect(del.what[0].sid).toBe(insOp.id.sid);
        expect(del.what[0].time).toBe(insOp.id.time);
        expect(del.what[0].span).toBe(1);
        expect(log.end.view()).toEqual({arr: [1]});
        log.end.applyPatch(undo);
        expect(log.end.view()).toEqual({arr: []});
      });

      test('can undo "arr" delete', () => {
        const {log} = setup({arr: [{a: 1}, {a: 2}, {a: 3}]});
        log.end.api.flush();
        log.end.api.arr(['arr']).del(1, 1);
        const patch = log.end.api.flush();
        const undo = log.undo(patch);
        expect(log.end.view()).toEqual({arr: [{a: 1}, {a: 3}]});
        log.end.applyPatch(undo);
        expect(log.end.view()).toEqual({arr: [{a: 1}, {a: 2}, {a: 3}]});
      });
    });
  });

  describe('LWW', () => {
    test('can undo object key write', () => {
      const {log} = setup({obj: {foo: s.con('bar')}});
      log.end.api.flush();
      expect(log.end.view()).toEqual({obj: {foo: 'bar'}});
      log.end.api.obj(['obj']).set({foo: s.con('baz')});
      expect(log.end.view()).toEqual({obj: {foo: 'baz'}});
      const patch = log.end.api.flush();
      expect(patch.ops.length).toBe(2);
      const insOp = patch.ops.find((op) => op.name() === 'ins_obj')!;
      const undo = log.undo(patch);
      expect(undo.ops.length).toBe(2);
      expect(log.end.view()).toEqual({obj: {foo: 'baz'}});
      log.end.applyPatch(undo);
      expect(log.end.view()).toEqual({obj: {foo: 'bar'}});
    });

    test('can undo object key delete', () => {
      const {log} = setup({obj: {foo: s.con('bar')}});
      log.end.api.flush();
      expect(log.end.view()).toEqual({obj: {foo: 'bar'}});
      log.end.api.obj(['obj']).del(['foo']);
      expect(log.end.view()).toEqual({obj: {}});
      const patch = log.end.api.flush();
      expect(patch.ops.length).toBe(2);
      const insOp = patch.ops.find((op) => op.name() === 'ins_obj')!;
      const undo = log.undo(patch);
      expect(undo.ops.length).toBe(2);
      expect(log.end.view()).toEqual({obj: {}});
      log.end.applyPatch(undo);
      expect(log.end.view()).toEqual({obj: {foo: 'bar'}});
    });

    test('can undo vector element write', () => {
      const {log} = setup({vec: s.vec(s.con('bar'))});
      log.end.api.flush();
      expect(log.end.view()).toEqual({vec: ['bar']});
      log.end.api.vec(['vec']).set([[0, s.con('baz')]]);
      expect(log.end.view()).toEqual({vec: ['baz']});
      const patch = log.end.api.flush();
      expect(patch.ops.length).toBe(2);
      const insOp = patch.ops.find((op) => op.name() === 'ins_vec')!;
      const undo = log.undo(patch);
      expect(undo.ops.length).toBe(2);
      expect(log.end.view()).toEqual({vec: ['baz']});
      log.end.applyPatch(undo);
      expect(log.end.view()).toEqual({vec: ['bar']});
    });

    test('can undo vector element "delete"', () => {
      const {log} = setup({vec: s.vec(s.con('bar'))});
      log.end.api.flush();
      expect(log.end.view()).toEqual({vec: ['bar']});
      log.end.api.vec(['vec']).set([[0, s.con(undefined)]]);
      expect(log.end.view()).toEqual({vec: [undefined]});
      const patch = log.end.api.flush();
      expect(patch.ops.length).toBe(2);
      const insOp = patch.ops.find((op) => op.name() === 'ins_vec')!;
      const undo = log.undo(patch);
      expect(undo.ops.length).toBe(2);
      expect(log.end.view()).toEqual({vec: [undefined]});
      log.end.applyPatch(undo);
      expect(log.end.view()).toEqual({vec: ['bar']});
    });

    test('can undo register write', () => {
      const {log} = setup({arr: [1]});
      log.end.api.flush();
      expect(log.end.view()).toEqual({arr: [1]});
      log.end.api.val(['arr', 0]).set(2);
      expect(log.end.view()).toEqual({arr: [2]});
      const patch = log.end.api.flush();
      expect(patch.ops.length).toBe(2);
      const insOp = patch.ops.find((op) => op.name() === 'ins_val')!;
      const undo = log.undo(patch);
      expect(undo.ops.length).toBe(2);
      expect(log.end.view()).toEqual({arr: [2]});
      log.end.applyPatch(undo);
      expect(log.end.view()).toEqual({arr: [1]});
    });
  });
});
