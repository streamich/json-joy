import {ServerVectorClock} from '../../../json-crdt-patch/clock';
import {PatchBuilder} from '../../../json-crdt-patch/PatchBuilder';
import {Model} from '../Model';

describe('server clock', () => {
  test('increments timestamps', () => {
    const model = Model.withServerClock();
    expect(model.clock.time).toBe(0);
    const patch = model.api.root(true).commit();
    expect(model.clock.time).toBe(1);
    expect(patch.ops.length).toBe(1);
    const patch2 = model.api.root({foo: 'bar'}).commit();
    model.applyPatch(patch2);
    model.applyPatch(patch2);
    expect(model.clock.time).toBe(1 + patch2.span());
    expect(model.toJson()).toEqual({foo: 'bar'});
  });

  test('cannot skip operations', () => {
    const model = Model.withServerClock();
    expect(model.clock.time).toBe(0);
    const patch = model.api.root(true).commit();
    expect(model.clock.time).toBe(1);
    const clock = model.clock.clone();
    clock.tick(1);
    const builder = new PatchBuilder(clock);
    builder.root(builder.json('a'));
    expect(() => model.applyPatch(builder.patch)).toThrow(new Error('TIME_TRAVEL'));
  });

  test('cloning creates model with server clock', () => {
    const model = Model.withServerClock();
    const patch = model.api.root('asdf').commit();
    const model2 = model.clone();
    expect(model2.clock.time).toBe(model.clock.time);
    expect(model2.clock).toBeInstanceOf(ServerVectorClock);
  });

  test('forking creates model with server clock', () => {
    const model = Model.withServerClock();
    const patch = model.api.root('asdf').commit();
    const model2 = model.fork();
    expect(model2.clock.time).toBe(model.clock.time);
    expect(model2.clock).toBeInstanceOf(ServerVectorClock);
  });
});
