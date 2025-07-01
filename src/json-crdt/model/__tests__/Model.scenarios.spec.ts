import {Model} from '../Model';
import {PatchBuilder} from '../../../json-crdt-patch/PatchBuilder';
import {ClockVector, tick} from '../../../json-crdt-patch/clock';

describe('Scenarios', () => {
  // https://youtu.be/GXJ0D2tfZCM?t=2359
  test('concurrently insert text at different positions', () => {
    const doc = Model.create(void 0, new ClockVector(100, 0));
    const builder1 = new PatchBuilder(doc.clock);
    const str = builder1.str();
    const ins1 = builder1.insStr(str, str, 'Helo');
    builder1.root(str);
    doc.applyPatch(builder1.patch);

    const builder2 = new PatchBuilder(doc.clock.fork(200));
    builder2.insStr(str, tick(ins1, 2), 'l');
    doc.applyPatch(builder2.patch);
    doc.applyPatch(builder2.patch);

    const builder3 = new PatchBuilder(doc.clock);
    builder3.insStr(str, tick(ins1, 3), '!');
    doc.applyPatch(builder3.patch);
    doc.applyPatch(builder3.patch);

    expect(doc.view()).toBe('Hello!');
  });

  test('concurrently insert text at different positions (reverse)', () => {
    const doc = Model.create(void 0, new ClockVector(100, 0));
    const builder1 = new PatchBuilder(doc.clock);
    const str = builder1.str();
    const ins1 = builder1.insStr(str, str, 'Helo');
    builder1.root(str);
    doc.applyPatch(builder1.patch);

    const builder2 = new PatchBuilder(doc.clock.fork(200));
    builder2.insStr(str, tick(ins1, 3), '!');
    doc.applyPatch(builder2.patch);
    doc.applyPatch(builder2.patch);

    const builder3 = new PatchBuilder(doc.clock);
    builder3.insStr(str, tick(ins1, 2), 'l');
    doc.applyPatch(builder3.patch);
    doc.applyPatch(builder3.patch);

    expect(doc.view()).toBe('Hello!');
  });

  // https://youtu.be/GXJ0D2tfZCM?t=2587
  test('concurrently insert text at the same position', () => {
    const doc = Model.create(void 0, new ClockVector(100, 0));
    const builder1 = new PatchBuilder(doc.clock);
    const str = builder1.str();
    const ins1 = builder1.insStr(str, str, 'abc');
    builder1.root(str);
    doc.applyPatch(builder1.patch);

    const builder2 = new PatchBuilder(doc.clock.fork(200));
    builder2.insStr(str, ins1, 'xy');

    const builder3 = new PatchBuilder(doc.clock);
    builder3.insStr(str, ins1, 'pq');

    doc.applyPatch(builder2.patch);
    doc.applyPatch(builder2.patch);
    doc.applyPatch(builder3.patch);
    doc.applyPatch(builder3.patch);

    expect(doc.view()).toBe('axypqbc');
  });

  test('concurrently insert text at the same position (2)', () => {
    const doc = Model.create(void 0, new ClockVector(100, 0));
    const builder1 = new PatchBuilder(doc.clock);
    const str = builder1.str();
    const ins1 = builder1.insStr(str, str, 'abc');
    builder1.root(str);
    doc.applyPatch(builder1.patch);

    const builder2 = new PatchBuilder(doc.clock.fork(200));
    builder2.insStr(str, ins1, 'xy');

    const builder3 = new PatchBuilder(doc.clock);
    builder3.insStr(str, ins1, 'pq');

    doc.applyPatch(builder3.patch);
    doc.applyPatch(builder2.patch);
    doc.applyPatch(builder3.patch);
    doc.applyPatch(builder2.patch);

    expect(doc.view()).toBe('axypqbc');
  });
});
