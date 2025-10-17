import {s} from '../../../json-crdt-patch';
import {Model} from '../Model';

describe('.applyLocalPatch()', () => {
  test('advances clock of a locally created patch', () => {
    const schema = s.obj({});
    const doc1 = Model.create(schema);
    const doc2 = doc1.clone();
    const time1 = doc1.clock.time;
    doc1.s.$.set({a: 1});
    const time2 = doc1.clock.time;
    doc2.s.$.set({b: 2});
    const time3 = doc1.clock.time;
    expect(time2 > time1).toBe(true);
    expect(time2).toBe(time3);
    const patch = doc2.api.flush()!;
    const time4 = patch.getId()!.time;
    expect(time4).toBe(time1);
    expect(doc1.view()).toEqual({a: 1});
    doc1.applyLocalPatch(patch);
    const time5 = doc1.clock.time;
    expect(time5 > time3).toBe(true);
    expect(doc1.view()).toEqual({a: 1, b: 2});
  });

  test('does not advance clock of a patch of a fork', () => {
    const schema = s.obj({});
    const doc1 = Model.create(schema);
    const doc2 = doc1.fork();
    const time1 = doc1.clock.time;
    doc1.s.$.set({a: 1});
    const time2 = doc1.clock.time;
    doc2.s.$.set({b: 2});
    const time3 = doc1.clock.time;
    expect(time2 > time1).toBe(true);
    expect(time2).toBe(time3);
    const patch = doc2.api.flush()!;
    const time4 = patch.getId()!.time;
    expect(time4).toBe(time1);
    expect(doc1.view()).toEqual({a: 1});
    doc1.applyLocalPatch(patch);
    const time5 = doc1.clock.time;
    expect(time5).toBe(time3);
    expect(doc1.view()).toEqual({a: 1, b: 2});
  });
});
