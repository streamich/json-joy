import {Model} from '../../../../json-crdt/model';
import {Peritext} from '../../Peritext';
import {Anchor} from '../../constants';
import {tick} from '../../../../json-crdt-patch/clock';

const setup = () => {
  const model = Model.withLogicalClock();
  model.api.root({
    text: 'abc',
    slices: [],
  });
  const peritext = new Peritext(model, model.api.str(['text']).node, model.api.arr(['slices']).node);
  return {model, peritext};
};

describe('.set()', () => {
  test('can overwrite a point with the same identity as another point', () => {
    const {peritext} = setup();
    const chunk = peritext.str.first()!;
    const id = chunk.id;
    const p1 = peritext.point(id, Anchor.Before);
    const p2 = peritext.point(id, Anchor.After);
    expect(p1.refresh()).not.toBe(p2.refresh());
    p1.set(p2);
    expect(p1.refresh()).toBe(p2.refresh());
    expect(p1.compare(p2)).toBe(0);
    expect(p1.compareSpatial(p2)).toBe(0);
    expect(p1.id.sid).toBe(p2.id.sid);
    expect(p1.id.time).toBe(p2.id.time);
    expect(p1.anchor).toBe(p2.anchor);
  });
});

describe('.clone()', () => {
  test('can create a new point with the same identity as another point', () => {
    const {peritext} = setup();
    const chunk = peritext.str.first()!;
    const id = chunk.id;
    const p1 = peritext.point(id, Anchor.Before);
    const p2 = p1.clone();
    expect(p1.refresh()).toBe(p2.refresh());
    expect(p1.compare(p2)).toBe(0);
    expect(p1.compareSpatial(p2)).toBe(0);
    expect(p1.id.sid).toBe(p2.id.sid);
    expect(p1.id.time).toBe(p2.id.time);
    expect(p1.anchor).toBe(p2.anchor);
  });
});

describe('.compare()', () => {
  test('returns 0 for equal points', () => {
    const {peritext} = setup();
    const chunk = peritext.str.first()!;
    const id = chunk.id;
    const p1 = peritext.point(id, Anchor.Before);
    const p2 = peritext.point(id, Anchor.Before);
    expect(p1.compare(p2)).toBe(0);
  });

  test('compares by ID first, then by anchor', () => {
    const {peritext} = setup();
    const chunk = peritext.str.first()!;
    const id1 = chunk.id;
    const id2 = tick(id1, 1);
    const id3 = tick(id1, 2);
    const p1 = peritext.point(id1, Anchor.Before);
    const p2 = peritext.point(id1, Anchor.After);
    const p3 = peritext.point(id2, Anchor.Before);
    const p4 = peritext.point(id2, Anchor.After);
    const p5 = peritext.point(id3, Anchor.Before);
    const p6 = peritext.point(id3, Anchor.After);
    const points = [p1, p2, p3, p4, p5, p6];
    for (let i = 0; i < points.length; i++) {
      for (let j = 0; j < points.length; j++) {
        const p1 = points[i];
        const p2 = points[j];
        if (i === j) {
          expect(p1.compare(p2)).toBe(0);
        } else if (i < j) {
          expect(p1.compare(p2)).toBeLessThan(0);
        } else {
          expect(p1.compare(p2)).toBeGreaterThan(0);
        }
      }
    }
  });
});

describe('.compareSpatial()', () => {
  test('higher spacial points return positive value', () => {
    const {peritext} = setup();
    const chunk1 = peritext.str.first()!;
    const id1 = chunk1.id;
    const id2 = tick(id1, 1);
    const p1 = peritext.point(id1, Anchor.Before);
    const p2 = peritext.point(id1, Anchor.After);
    const p3 = peritext.point(id2, Anchor.Before);
    const p4 = peritext.point(id2, Anchor.After);
    expect(p1.compareSpatial(p1)).toBe(0);
    expect(p4.compareSpatial(p4)).toBe(0);
    expect(p4.compareSpatial(p4)).toBe(0);
    expect(p4.compareSpatial(p4)).toBe(0);
    expect(p2.compareSpatial(p1) > 0).toBe(true);
    expect(p3.compareSpatial(p1) > 0).toBe(true);
    expect(p4.compareSpatial(p1) > 0).toBe(true);
    expect(p3.compareSpatial(p2) > 0).toBe(true);
    expect(p4.compareSpatial(p2) > 0).toBe(true);
    expect(p4.compareSpatial(p3) > 0).toBe(true);
    expect(p1.compareSpatial(p2) < 0).toBe(true);
    expect(p1.compareSpatial(p3) < 0).toBe(true);
    expect(p1.compareSpatial(p4) < 0).toBe(true);
    expect(p2.compareSpatial(p3) < 0).toBe(true);
    expect(p2.compareSpatial(p4) < 0).toBe(true);
    expect(p3.compareSpatial(p4) < 0).toBe(true);
  });

  test('correctly orders points when tombstones are present', () => {
    const model = Model.withLogicalClock(123456);
    model.api.root({
      text: '3',
      slices: [],
    });
    const str = model.api.str(['text']).node;
    const peritext = new Peritext(model, str, model.api.arr(['slices']).node);
    const chunk3 = str.root!;
    model.api.str(['text']).ins(1, '4');
    const chunk4 = str.last()!;
    model.api.str(['text']).ins(0, '2');
    const chunk2 = str.first()!;
    model.api.str(['text']).ins(3, '5');
    const chunk5 = str.last()!;
    model.api.str(['text']).ins(0, '1');
    const chunk1 = str.first()!;
    model.api.str(['text']).del(0, 2);
    model.api.str(['text']).del(1, 2);
    const p1 = peritext.point(chunk1.id, Anchor.Before);
    const p2 = peritext.point(chunk2.id, Anchor.Before);
    const p3 = peritext.point(chunk3.id, Anchor.Before);
    const p4 = peritext.point(chunk4.id, Anchor.Before);
    const p5 = peritext.point(chunk5.id, Anchor.Before);
    const pp1 = peritext.point(chunk1.id, Anchor.After);
    const pp2 = peritext.point(chunk2.id, Anchor.After);
    const pp3 = peritext.point(chunk3.id, Anchor.After);
    const pp4 = peritext.point(chunk4.id, Anchor.After);
    const pp5 = peritext.point(chunk5.id, Anchor.After);
    const points = [p1, pp1, p2, pp2, p3, pp3, p4, pp4, p5, pp5];
    for (let i = 0; i < points.length; i++) {
      for (let j = 0; j < points.length; j++) {
        const p1 = points[i];
        const p2 = points[j];
        try {
          if (i === j) {
            expect(p1.compareSpatial(p2)).toBe(0);
          } else if (i < j) {
            expect(p1.compareSpatial(p2)).toBeLessThan(0);
          } else {
            expect(p1.compareSpatial(p2)).toBeGreaterThan(0);
          }
        } catch (error) {
          // tslint:disable-next-line:no-console
          console.log('i: ', i, 'j: ', j, 'p1: ', p1 + '', 'p2: ', p2 + '', p1.compareSpatial(p2));
          throw error;
        }
      }
    }
  });
});

const setupWithText = () => {
  const model = Model.withLogicalClock(123456);
  model.api.root({
    text: '3',
    slices: [],
  });
  const str = model.api.str(['text']).node;
  const peritext = new Peritext(model, str, model.api.arr(['slices']).node);
  const chunk3 = str.root!;
  model.api.str(['text']).ins(1, '4');
  const chunk4 = str.last()!;
  model.api.str(['text']).ins(0, '2');
  const chunk2 = str.first()!;
  model.api.str(['text']).ins(3, '5');
  const chunk5 = str.last()!;
  model.api.str(['text']).ins(4, '678');
  const chunk6 = str.last()!;
  model.api.str(['text']).ins(0, '1');
  const chunk1 = str.first()!;
  model.api.str(['text']).del(0, 2);
  model.api.str(['text']).del(1, 3);
  model.api.str(['text']).ins(1, '456');
  model.api.str(['text']).ins(0, '012');
  return {
    model,
    str,
    peritext,
    chunk1,
    chunk2,
    chunk3,
    chunk4,
    chunk5,
    chunk6,
  };
};

const setupWithChunkedText = () => {
  const model = Model.withLogicalClock(123456);
  model.api.root({
    text: '',
    slices: [],
  });
  const str = model.api.str(['text']).node;
  const peritext = new Peritext(model, str, model.api.arr(['slices']).node);
  model.api.str(['text']).ins(0, '789');
  const chunk3 = str.first()!;
  model.api.str(['text']).ins(0, 'd');
  const chunkD2 = str.first()!;
  model.api.str(['text']).ins(0, '456');
  const chunk2 = str.first()!;
  model.api.str(['text']).ins(0, 'd');
  const chunkD1 = str.first()!;
  model.api.str(['text']).ins(0, '123');
  const chunk1 = str.first()!;
  model.api.str(['text']).del(3, 1);
  model.api.str(['text']).del(6, 1);
  return {
    model,
    str,
    peritext,
    chunk1,
    chunk2,
    chunk3,
    chunkD1,
    chunkD2,
  };
};

describe('.pos()', () => {
  test('returns character position, regardless of anchor point, for visible and deleted chars', () => {
    const {str, peritext, chunk1, chunk2, chunk3, chunk4, chunk5} = setupWithText();
    const [chunk3Before] = str.findChunk(0)!;
    const [chunk3After] = str.findChunk(4)!;
    const visibleIDs = [
      chunk3Before.id,
      tick(chunk3Before.id, 1),
      tick(chunk3Before.id, 2),
      chunk3.id,
      chunk3After.id,
      tick(chunk3After.id, 1),
      tick(chunk3After.id, 2),
    ];
    // Visible characters
    for (let i = 0; i < visibleIDs.length; i++) {
      const visibleId = visibleIDs[i];
      const p1 = peritext.point(visibleId, Anchor.Before);
      const p2 = peritext.point(visibleId, Anchor.After);
      expect(p1.pos()).toBe(i);
      expect(p2.pos()).toBe(i);
    }
    // Deleted characters
    const p1Before = peritext.point(chunk1.id, Anchor.Before);
    const p1After = peritext.point(chunk1.id, Anchor.After);
    expect(p1Before.pos()).toBe(3);
    expect(p1After.pos()).toBe(3);
    const p2Before = peritext.point(chunk2.id, Anchor.Before);
    const p2After = peritext.point(chunk2.id, Anchor.After);
    expect(p2Before.pos()).toBe(3);
    expect(p2After.pos()).toBe(3);
    const p4Before = peritext.point(chunk4.id, Anchor.Before);
    const p4After = peritext.point(chunk4.id, Anchor.After);
    expect(p4Before.pos()).toBe(7);
    expect(p4After.pos()).toBe(7);
    const p5Before = peritext.point(chunk5.id, Anchor.Before);
    const p5After = peritext.point(chunk5.id, Anchor.After);
    expect(p5Before.pos()).toBe(7);
    expect(p5After.pos()).toBe(7);
  });
});

describe('.viewPos()', () => {
  test('returns index position in view, for visible and deleted chars', () => {
    const {str, peritext, chunk1, chunk2, chunk3, chunk4, chunk5} = setupWithText();
    const [chunk3Before] = str.findChunk(0)!;
    const [chunk3After] = str.findChunk(4)!;
    const visibleIDs = [
      chunk3Before.id,
      tick(chunk3Before.id, 1),
      tick(chunk3Before.id, 2),
      chunk3.id,
      chunk3After.id,
      tick(chunk3After.id, 1),
      tick(chunk3After.id, 2),
    ];
    // Visible characters
    for (let i = 0; i < visibleIDs.length; i++) {
      const visibleId = visibleIDs[i];
      const p1 = peritext.point(visibleId, Anchor.Before);
      const p2 = peritext.point(visibleId, Anchor.After);
      expect(p1.viewPos()).toBe(i);
      expect(p2.viewPos()).toBe(i + 1);
    }
    // Deleted characters
    const p1Before = peritext.point(chunk1.id, Anchor.Before);
    const p1After = peritext.point(chunk1.id, Anchor.After);
    expect(p1Before.viewPos()).toBe(3);
    expect(p1After.viewPos()).toBe(4);
    const p2Before = peritext.point(chunk2.id, Anchor.Before);
    const p2After = peritext.point(chunk2.id, Anchor.After);
    expect(p2Before.viewPos()).toBe(3);
    expect(p2After.viewPos()).toBe(4);
    const p4Before = peritext.point(chunk4.id, Anchor.Before);
    const p4After = peritext.point(chunk4.id, Anchor.After);
    expect(p4Before.viewPos()).toBe(7);
    expect(p4After.viewPos()).toBe(8);
    const p5Before = peritext.point(chunk5.id, Anchor.Before);
    const p5After = peritext.point(chunk5.id, Anchor.After);
    expect(p5Before.viewPos()).toBe(7);
    expect(p5After.viewPos()).toBe(8);
  });
});

describe('.nextId()', () => {
  test('can iterate through all IDs, starting from visible or hidden', () => {
    const {str, peritext, chunk1, chunk2, chunk3, chunk4, chunk5, chunk6} = setupWithText();
    const [chunk3Before] = str.findChunk(0)!;
    const [chunk3After] = str.findChunk(4)!;
    const visibleIDs = [
      chunk3Before.id,
      tick(chunk3Before.id, 1),
      tick(chunk3Before.id, 2),
      chunk3.id,
      chunk3After.id,
      tick(chunk3After.id, 1),
      tick(chunk3After.id, 2),
    ];
    // Visible characters
    for (let i = 0; i < visibleIDs.length - 1; i++) {
      const visibleId = visibleIDs[i];
      const p1 = peritext.point(visibleId, Anchor.Before);
      const p2 = peritext.point(visibleId, Anchor.After);
      const nextP1 = p1.nextId();
      const nextP2 = p2.nextId();
      expect(nextP1).toEqual(visibleIDs[i + 1]);
      expect(nextP2).toEqual(visibleIDs[i + 1]);
    }
    // Deleted characters
    const p1Before = peritext.point(chunk1.id, Anchor.Before);
    const p1After = peritext.point(chunk1.id, Anchor.After);
    expect(p1Before.nextId()).toEqual(visibleIDs[3]);
    expect(p1After.nextId()).toEqual(visibleIDs[3]);
    const p2Before = peritext.point(chunk2.id, Anchor.Before);
    const p2After = peritext.point(chunk2.id, Anchor.After);
    expect(p2Before.nextId()).toEqual(visibleIDs[3]);
    expect(p2After.nextId()).toEqual(visibleIDs[3]);
    const p4Before = peritext.point(chunk4.id, Anchor.Before);
    const p4After = peritext.point(chunk4.id, Anchor.After);
    expect(p4Before.nextId()).toEqual(tick(chunk6.id, 2));
    expect(p4After.nextId()).toEqual(tick(chunk6.id, 2));
    const p5Before = peritext.point(chunk5.id, Anchor.Before);
    const p5After = peritext.point(chunk5.id, Anchor.After);
    expect(p5Before.nextId()).toEqual(tick(chunk6.id, 2));
    expect(p5After.nextId()).toEqual(tick(chunk6.id, 2));
  });

  test('can iterate through multi-char chunk', () => {
    const {peritext, chunk1, chunk2, chunk3, chunkD1, chunkD2} = setupWithChunkedText();
    const visibleIDs = [
      tick(chunk1.id, 0),
      tick(chunk1.id, 1),
      tick(chunk1.id, 2),
      tick(chunk2.id, 0),
      tick(chunk2.id, 1),
      tick(chunk2.id, 2),
      tick(chunk3.id, 0),
      tick(chunk3.id, 1),
      tick(chunk3.id, 2),
    ];
    // Visible characters
    for (let i = 0; i < visibleIDs.length - 1; i++) {
      const visibleId = visibleIDs[i];
      const p1 = peritext.point(visibleId, Anchor.Before);
      const p2 = peritext.point(visibleId, Anchor.After);
      for (let j = i; j < visibleIDs.length - 1; j++) {
        expect(p1.nextId(1 + j - i)).toEqual(visibleIDs[j + 1]);
        expect(p2.nextId(1 + j - i)).toEqual(visibleIDs[j + 1]);
      }
      expect(p1.nextId(visibleIDs.length)).toEqual(undefined);
      expect(p2.nextId(visibleIDs.length)).toEqual(undefined);
    }
    // Deleted characters
    const p1Before = peritext.point(chunkD1.id, Anchor.Before);
    const p1After = peritext.point(chunkD1.id, Anchor.After);
    for (let i = 0; i < 6; i++) {
      expect(p1Before.nextId(i + 1)).toEqual(visibleIDs[3 + i]);
      expect(p1After.nextId(i + 1)).toEqual(visibleIDs[3 + i]);
    }
    expect(p1Before.nextId(visibleIDs.length)).toEqual(undefined);
    expect(p1After.nextId(visibleIDs.length)).toEqual(undefined);
    const p2Before = peritext.point(chunkD2.id, Anchor.Before);
    const p2After = peritext.point(chunkD2.id, Anchor.After);
    for (let i = 0; i < 3; i++) {
      expect(p2Before.nextId(i + 1)).toEqual(visibleIDs[6 + i]);
      expect(p2After.nextId(i + 1)).toEqual(visibleIDs[6 + i]);
    }
    expect(p2Before.nextId(visibleIDs.length)).toEqual(undefined);
    expect(p2After.nextId(visibleIDs.length)).toEqual(undefined);
  });
});

describe('.prevId()', () => {
  test('can iterate through all IDs, starting from visible or hidden', () => {
    const {str, peritext, chunk1, chunk2, chunk3, chunk4, chunk5} = setupWithText();
    const [chunk3Before] = str.findChunk(0)!;
    const [chunk3After] = str.findChunk(4)!;
    const visibleIDs = [
      chunk3Before.id,
      tick(chunk3Before.id, 1),
      tick(chunk3Before.id, 2),
      chunk3.id,
      chunk3After.id,
      tick(chunk3After.id, 1),
      tick(chunk3After.id, 2),
    ];
    // Visible characters
    for (let i = 1; i < visibleIDs.length; i++) {
      const visibleId = visibleIDs[i];
      const p1 = peritext.point(visibleId, Anchor.Before);
      const p2 = peritext.point(visibleId, Anchor.After);
      const nextP1 = p1.prevId();
      const nextP2 = p2.prevId();
      expect(nextP1).toEqual(visibleIDs[i - 1]);
      expect(nextP2).toEqual(visibleIDs[i - 1]);
    }
    // Deleted characters
    const p1Before = peritext.point(chunk1.id, Anchor.Before);
    const p1After = peritext.point(chunk1.id, Anchor.After);
    expect(p1Before.prevId()).toEqual(visibleIDs[2]);
    expect(p1After.prevId()).toEqual(visibleIDs[2]);
    const p2Before = peritext.point(chunk2.id, Anchor.Before);
    const p2After = peritext.point(chunk2.id, Anchor.After);
    expect(p2Before.prevId()).toEqual(visibleIDs[2]);
    expect(p2After.prevId()).toEqual(visibleIDs[2]);
    const p4Before = peritext.point(chunk4.id, Anchor.Before);
    const p4After = peritext.point(chunk4.id, Anchor.After);
    expect(p4Before.prevId()).toEqual(visibleIDs[6]);
    expect(p4After.prevId()).toEqual(visibleIDs[6]);
    const p5Before = peritext.point(chunk5.id, Anchor.Before);
    const p5After = peritext.point(chunk5.id, Anchor.After);
    expect(p5Before.prevId()).toEqual(visibleIDs[6]);
    expect(p5After.prevId()).toEqual(visibleIDs[6]);
  });

  test('can iterate through multi-char chunk', () => {
    const {peritext, chunk1, chunk2, chunk3, chunkD1, chunkD2} = setupWithChunkedText();
    const visibleIDs = [
      tick(chunk1.id, 0),
      tick(chunk1.id, 1),
      tick(chunk1.id, 2),
      tick(chunk2.id, 0),
      tick(chunk2.id, 1),
      tick(chunk2.id, 2),
      tick(chunk3.id, 0),
      tick(chunk3.id, 1),
      tick(chunk3.id, 2),
    ];
    // Visible characters
    for (let i = 1; i < visibleIDs.length; i++) {
      const visibleId = visibleIDs[i];
      const p1 = peritext.point(visibleId, Anchor.Before);
      const p2 = peritext.point(visibleId, Anchor.After);
      for (let j = 1; j < i; j++) {
        expect(p1.prevId(j)).toEqual(visibleIDs[i - j]);
        expect(p2.prevId(j)).toEqual(visibleIDs[i - j]);
      }
      expect(p1.prevId(i + 1)).toEqual(undefined);
      expect(p2.prevId(i + 1)).toEqual(undefined);
    }
    // Deleted characters
    const p1Before = peritext.point(chunkD1.id, Anchor.Before);
    const p1After = peritext.point(chunkD1.id, Anchor.After);
    for (let i = 0; i < 3; i++) {
      expect(p1Before.prevId(i + 1)).toEqual(visibleIDs[2 - i]);
      expect(p1After.prevId(i + 1)).toEqual(visibleIDs[2 - i]);
    }
    expect(p1Before.prevId(4)).toEqual(undefined);
    expect(p1After.prevId(4)).toEqual(undefined);
    expect(p1Before.prevId(5)).toEqual(undefined);
    expect(p1After.prevId(5)).toEqual(undefined);
    const p2Before = peritext.point(chunkD2.id, Anchor.Before);
    const p2After = peritext.point(chunkD2.id, Anchor.After);
    for (let i = 0; i < 6; i++) {
      expect(p2Before.prevId(i + 1)).toEqual(visibleIDs[5 - i]);
      expect(p2After.prevId(i + 1)).toEqual(visibleIDs[5 - i]);
    }
    expect(p2Before.prevId(7)).toEqual(undefined);
    expect(p2After.prevId(7)).toEqual(undefined);
    expect(p2Before.prevId(8)).toEqual(undefined);
    expect(p2After.prevId(8)).toEqual(undefined);
  });
});
