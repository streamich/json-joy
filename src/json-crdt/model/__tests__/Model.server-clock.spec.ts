import {ServerVectorClock} from '../../../json-crdt-patch/clock';
import {PatchBuilder} from '../../../json-crdt-patch/PatchBuilder';
import {Model} from '../Model';

describe('server clock', () => {
  test('increments timestamps', () => {
    const model = Model.withServerClock();
    expect(model.clock.time).toBe(1);
    model.api.root(true);
    expect(model.clock.time).toBe(4);
    model.api.root({foo: 'bar'});
    model.applyPatch(model.api.builder.patch);
    model.applyPatch(model.api.builder.patch);
    expect(model.view()).toEqual({foo: 'bar'});
  });

  test('cannot skip operations', () => {
    const model = Model.withServerClock();
    expect(model.clock.time).toBe(1);
    model.api.root(true);
    expect(model.clock.time).toBe(4);
    const clock = model.clock.clone();
    clock.tick(1);
    const builder = new PatchBuilder(clock);
    builder.root(builder.json('a'));
    expect(() => model.applyPatch(builder.patch)).toThrow(new Error('TIME_TRAVEL'));
  });

  test('cloning creates model with server clock', () => {
    const model = Model.withServerClock();
    model.api.root('asdf');
    const model2 = model.clone();
    expect(model2.clock.time).toBe(model.clock.time);
    expect(model2.clock).toBeInstanceOf(ServerVectorClock);
  });

  test('forking creates model with server clock', () => {
    const model = Model.withServerClock();
    model.api.root('asdf');
    const model2 = model.fork();
    expect(model2.clock.time).toBe(model.clock.time);
    expect(model2.clock).toBeInstanceOf(ServerVectorClock);
  });
});
