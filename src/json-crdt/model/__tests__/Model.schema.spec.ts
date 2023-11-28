import {nodes, s} from '../../../json-crdt-patch';
import {Model} from '../Model';

test('can set object schema', () => {
  const model = Model.withLogicalClock().setSchema(s.obj({
    str: s.str('asdf'),
    con: s.con(123),
  }));
  expect(model.s.str.toApi().view()).toBe('asdf');
  expect(model.s.con.toApi().view()).toBe(123);
});

test('can set map schema', () => {
  const model = Model.withLogicalClock().setSchema(s.map<nodes.str | nodes.con<number>>({
    str: s.str('asdf'),
    con1: s.con(123),
    // con2: s.con('asdf'),
    // arr: s.arr(123),
  }));
  expect(model.s.str.toApi().view()).toBe('asdf');
  expect(model.s.con1.toApi().view()).toBe(123);
  expect(model.view().str).toBe('asdf');
  expect(model.view().con1).toBe(123);
  expect(model.view().anyKeyAllowed).toBe(undefined);
});

