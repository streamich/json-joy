import {LogicalClock} from '../../../json-crdt-patch/clock';
import {TRUE_ID} from '../../../json-crdt-patch/constants';
import {PatchBuilder} from '../../../json-crdt-patch/PatchBuilder';
import {Model} from '../Model';

test('new document time starts from zero', () => {
  const doc = new Model();
  expect(doc.clock.time).toBe(0);
});

test('local time is incremented on local operation application', () => {
  const doc = new Model();
  const builder1 = new PatchBuilder(doc.clock);
  builder1.root(TRUE_ID);
  doc.applyPatch(builder1.patch);
  expect(doc.toJson()).toEqual(true);
  expect(doc.clock.time).toBe(1);
});

test('local time is incremented on remote operation application', () => {
  const doc = new Model();
  const builder1 = new PatchBuilder(new LogicalClock(123, 0));
  builder1.root(TRUE_ID);
  doc.applyPatch(builder1.patch);
  expect(doc.toJson()).toEqual(true);
  expect(doc.clock.time).toBe(1);
});

test('local time is incremented on remote operation application - 2', () => {
  const doc = new Model();
  const builder1 = new PatchBuilder(new LogicalClock(123, 0));
  builder1.root(builder1.json({a: 'b'}));
  doc.applyPatch(builder1.patch);
  expect(doc.toJson()).toEqual({a: 'b'});
  expect(doc.clock.time).toBe(5);
});
