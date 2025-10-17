import {cnt} from '..';
import {Model} from '../../../json-crdt/model';

test('view should preserve identity', () => {
  const model = Model.create();
  model.ext.register(cnt);
  model.api.set({
    counter: cnt.new(),
  });
  expect(model.view()).toBe(model.view());
});

test('can set new values in single fork', () => {
  const model = Model.create();
  model.ext.register(cnt);
  model.api.set({
    counter: cnt.new(24),
  });
  expect(model.view()).toEqual({counter: 24});
  const counter = model.api.in(['counter']).asExt(cnt);
  expect(counter.view()).toBe(24);
  counter.inc(2);
  expect(model.view()).toEqual({counter: 26});
  counter.inc(-10);
  expect(counter.view()).toBe(16);
});

test('two concurrent users can increment the counter', () => {
  const model = Model.create();
  model.ext.register(cnt);
  model.api.set({
    counter: cnt.new(),
  });
  expect(model.view()).toEqual({counter: 0});
  const counter = model.api.in(['counter']).asExt(cnt);
  expect(counter.view()).toBe(0);
  const model2 = model.fork();
  const counter2 = model2.api.in(['counter']).asExt(cnt);
  counter.inc(2);
  counter2.inc(3);
  model.applyPatch(model2.api.flush());
  expect(model.view()).toEqual({counter: 5});
  expect(counter.view()).toBe(5);
});
