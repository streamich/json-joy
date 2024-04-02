import {Model} from '../../model';
import {Log} from '../Log';

const setup = (view: unknown) => {
  const model = Model.withServerClock();
  model.api.root(view);
  const log = Log.fromNewModel(model);
  return {log};
};

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
