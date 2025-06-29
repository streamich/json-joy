import {LogicalClock} from '../../../json-crdt-patch/clock';
import {PatchBuilder} from '../../../json-crdt-patch/PatchBuilder';
import {Model} from '../Model';

test('new document time starts from one', () => {
  const doc = Model.create();
  expect(doc.clock.time).toBe(1);
});

test('local time is incremented on local operation application', () => {
  const doc = Model.create();
  const time = doc.clock.time;
  const builder1 = new PatchBuilder(doc.clock);
  const t = builder1.con(true);
  builder1.root(t);
  doc.applyPatch(builder1.patch);
  expect(doc.view()).toEqual(true);
  expect(doc.clock.time > time).toBe(true);
});

test('local time is incremented on remote operation application', () => {
  const doc = Model.create();
  const builder1 = new PatchBuilder(new LogicalClock(123, 1));
  const time = doc.clock.time;
  const t = builder1.con(true);
  builder1.root(t);
  doc.applyPatch(builder1.patch);
  expect(doc.view()).toEqual(true);
  expect(doc.clock.time > time).toBe(true);
});

test('local time is incremented on remote operation application - 2', () => {
  const doc = Model.create();
  const time = doc.clock.time;
  const builder1 = new PatchBuilder(new LogicalClock(123, 1));
  builder1.root(builder1.json({a: 'b'}));
  doc.applyPatch(builder1.patch);
  expect(doc.view()).toEqual({a: 'b'});
  expect(doc.clock.time > time).toBe(true);
});
