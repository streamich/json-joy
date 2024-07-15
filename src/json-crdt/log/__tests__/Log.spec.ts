import {s} from '../../../json-crdt-patch';
import {Model} from '../../model';
import {Log} from '../Log';

const setup = (view: unknown) => {
  const model = Model.withServerClock();
  model.api.root(view);
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
  log.end.s.toApi().set({id: s.con('xyz') as any});
  log.end.api.flush();
  log.end.s.age.toApi().set(35);
  log.end.api.flush();
  log.end.s.tags.toApi().del(0, 1);
  log.end.api.flush();
  log.end.s.name.toApi().del(0, 8);
  log.end.s.name.toApi().ins(0, 'Va Da');
  log.end.api.flush();
  log.end.s.tags[0].toApi().del(0, 4);
  log.end.s.tags[0].toApi().ins(0, 'happy');
  log.end.api.flush();
  expect(log.start().clock.sid).toBe(sid);
  expect(log.start().clock.time).toBe(1);
  expect(log.end.clock.sid).toBe(sid);
  expect(log.end.clock.time > 10).toBe(true);
});

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
