import {Model} from '../../../../json-crdt/model';
import {Peritext} from '../../Peritext';
import {Anchor} from '../constants';
import {tick} from '../../../../json-crdt-patch/clock';
import type {Point} from '../Point';

const setup = () => {
  const model = Model.withLogicalClock();
  model.api.root({
    text: 'abc',
    slices: [],
    data: {},
  });
  const peritext = new Peritext(model, model.api.str(['text']).node, model.api.arr(['slices']).node, model.api.obj(['data']));
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
    expect(p1.cmp(p2)).toBe(0);
    expect(p1.cmpSpatial(p2)).toBe(0);
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
    expect(p1.cmp(p2)).toBe(0);
    expect(p1.cmpSpatial(p2)).toBe(0);
    expect(p1.id.sid).toBe(p2.id.sid);
    expect(p1.id.time).toBe(p2.id.time);
    expect(p1.anchor).toBe(p2.anchor);
  });
});

describe('.cmp()', () => {
  test('returns 0 for equal points', () => {
    const {peritext} = setup();
    const chunk = peritext.str.first()!;
    const id = chunk.id;
    const p1 = peritext.point(id, Anchor.Before);
    const p2 = peritext.point(id, Anchor.Before);
    expect(p1.cmp(p2)).toBe(0);
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
          expect(p1.cmp(p2)).toBe(0);
        } else if (i < j) {
          expect(p1.cmp(p2)).toBeLessThan(0);
        } else {
          expect(p1.cmp(p2)).toBeGreaterThan(0);
        }
      }
    }
  });
});

describe('.cmpSpatial()', () => {
  test('higher spacial points return positive value', () => {
    const {peritext} = setup();
    const chunk1 = peritext.str.first()!;
    const id1 = chunk1.id;
    const id2 = tick(id1, 1);
    const p1 = peritext.point(id1, Anchor.Before);
    const p2 = peritext.point(id1, Anchor.After);
    const p3 = peritext.point(id2, Anchor.Before);
    const p4 = peritext.point(id2, Anchor.After);
    expect(p1.cmpSpatial(p1)).toBe(0);
    expect(p4.cmpSpatial(p4)).toBe(0);
    expect(p4.cmpSpatial(p4)).toBe(0);
    expect(p4.cmpSpatial(p4)).toBe(0);
    expect(p2.cmpSpatial(p1) > 0).toBe(true);
    expect(p3.cmpSpatial(p1) > 0).toBe(true);
    expect(p4.cmpSpatial(p1) > 0).toBe(true);
    expect(p3.cmpSpatial(p2) > 0).toBe(true);
    expect(p4.cmpSpatial(p2) > 0).toBe(true);
    expect(p4.cmpSpatial(p3) > 0).toBe(true);
    expect(p1.cmpSpatial(p2) < 0).toBe(true);
    expect(p1.cmpSpatial(p3) < 0).toBe(true);
    expect(p1.cmpSpatial(p4) < 0).toBe(true);
    expect(p2.cmpSpatial(p3) < 0).toBe(true);
    expect(p2.cmpSpatial(p4) < 0).toBe(true);
    expect(p3.cmpSpatial(p4) < 0).toBe(true);
  });

  test('correctly orders points when tombstones are present', () => {
    const model = Model.withLogicalClock(123456);
    model.api.root({
      text: '3',
      slices: [],
      data: {},
    });
    const str = model.api.str(['text']).node;
    const peritext = new Peritext(model, str, model.api.arr(['slices']).node, model.api.obj(['data']));
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
            expect(p1.cmpSpatial(p2)).toBe(0);
          } else if (i < j) {
            expect(p1.cmpSpatial(p2)).toBeLessThan(0);
          } else {
            expect(p1.cmpSpatial(p2)).toBeGreaterThan(0);
          }
        } catch (error) {
          // tslint:disable-next-line:no-console
          console.log('i: ', i, 'j: ', j, 'p1: ', p1 + '', 'p2: ', p2 + '', p1.cmpSpatial(p2));
          throw error;
        }
      }
    }
  });

  test('absolute end point is always greater than any other point', () => {
    const {peritext} = setup();
    const chunk1 = peritext.str.first()!;
    const absoluteEnd = peritext.pointAbsEnd();
    const id1 = chunk1.id;
    const id2 = tick(id1, 1);
    const id3 = tick(id1, 2);
    const p0 = peritext.pointAbsStart();
    const p1 = peritext.point(id1, Anchor.Before);
    const p2 = peritext.point(id1, Anchor.After);
    const p3 = peritext.point(id2, Anchor.Before);
    const p4 = peritext.point(id2, Anchor.After);
    const p5 = peritext.point(id3, Anchor.Before);
    const p6 = peritext.point(id3, Anchor.After);
    const points = [p0, p1, p2, p3, p4, p5, p6];
    for (const point of points) {
      expect(absoluteEnd.cmpSpatial(point)).toBe(1);
      expect(point.cmpSpatial(absoluteEnd)).toBe(-1);
    }
  });

  test('two absolute ends are equal', () => {
    const {peritext} = setup();
    const p1 = peritext.pointAbsEnd();
    const p2 = peritext.pointAbsEnd();
    expect(p1.cmpSpatial(p2)).toBe(0);
    expect(p2.cmpSpatial(p1)).toBe(0);
  });

  test('absolute start point is always less than any other point', () => {
    const {peritext} = setup();
    const chunk1 = peritext.str.first()!;
    const absoluteEnd = peritext.pointAbsStart();
    const id1 = chunk1.id;
    const id2 = tick(id1, 1);
    const id3 = tick(id1, 2);
    const p0 = peritext.pointAbsEnd();
    const p1 = peritext.point(id1, Anchor.Before);
    const p2 = peritext.point(id1, Anchor.After);
    const p3 = peritext.point(id2, Anchor.Before);
    const p4 = peritext.point(id2, Anchor.After);
    const p5 = peritext.point(id3, Anchor.Before);
    const p6 = peritext.point(id3, Anchor.After);
    const points = [p0, p1, p2, p3, p4, p5, p6];
    for (const point of points) {
      expect(absoluteEnd.cmpSpatial(point)).toBe(-1);
      expect(point.cmpSpatial(absoluteEnd)).toBe(1);
    }
  });

  test('two absolute starts are equal', () => {
    const {peritext} = setup();
    const p1 = peritext.pointAbsStart();
    const p2 = peritext.pointAbsStart();
    expect(p1.cmpSpatial(p2)).toBe(0);
    expect(p2.cmpSpatial(p1)).toBe(0);
  });
});

describe('.chunk()', () => {
  test('returns correct chunk when chunk is split', () => {
    const {peritext} = setup();
    const p1 = peritext.pointAt(0, Anchor.Before);
    const p2 = peritext.pointAt(1, Anchor.Before);
    const p3 = peritext.pointAt(2, Anchor.Before);
    expect(p1.rightChar()!.view()).toBe('a');
    expect(p2.rightChar()!.view()).toBe('b');
    expect(p3.rightChar()!.view()).toBe('c');
    expect(p1.chunk()!.id.time).toBe(p1.id.time);
    expect(p2.chunk()!.id.time + 1).toBe(p2.id.time);
    expect(p3.chunk()!.id.time + 2).toBe(p3.id.time);
    peritext.strApi().del(1, 1);
    expect(p1.rightChar()!.view()).toBe('a');
    expect(p3.rightChar()!.view()).toBe('c');
    expect(p1.chunk()!.id.time).toBe(p1.id.time);
    expect(p2.chunk()!.id.time).toBe(p2.id.time);
    expect(p3.chunk()!.id.time).toBe(p3.id.time);
  });
});

const setupWithText = () => {
  const model = Model.withLogicalClock(123456);
  model.api.root({
    text: '3',
    slices: [],
    data: {},
  });
  const str = model.api.str(['text']).node;
  const peritext = new Peritext(model, str, model.api.arr(['slices']).node, model.api.obj(['data']));
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
    data: {},
  });
  const str = model.api.str(['text']).node;
  const peritext = new Peritext(model, str, model.api.arr(['slices']).node, model.api.obj(['data']));
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

  test('can move zero characters', () => {
    const {peritext, chunk2, chunkD1} = setupWithChunkedText();
    const p1 = peritext.point(chunk2.id, Anchor.Before);
    expect(p1.leftChar()!.view()).toBe('3');
    p1.prevId(0);
    expect(p1.leftChar()!.view()).toBe('3');
    const p2 = peritext.point(chunkD1.id, Anchor.Before);
    expect(p2.leftChar()!.view()).toBe('3');
    p2.prevId(0);
    expect(p2.leftChar()!.view()).toBe('3');
  });

  test('returns undefined, when at end of str', () => {
    const {peritext} = setupWithChunkedText();
    const point = peritext.pointAbsEnd();
    expect(point.nextId()).toBe(undefined);
  });

  test('returns undefined, when at last char', () => {
    const {peritext} = setupWithChunkedText();
    const point = peritext.pointAt(8, Anchor.Before);
    expect(point.nextId()).toBe(undefined);
  });

  test('returns first char, when at start of str', () => {
    const {peritext, chunk1} = setupWithChunkedText();
    const point = peritext.pointAbsStart();
    const id = point.nextId();
    expect(id).toEqual(chunk1.id);
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

  test('can move zero characters', () => {
    const {peritext, chunk2, chunkD1} = setupWithChunkedText();
    const p1 = peritext.point(chunk2.id, Anchor.Before);
    expect(p1.rightChar()!.view()).toBe('4');
    p1.nextId(0);
    expect(p1.rightChar()!.view()).toBe('4');
    const p2 = peritext.point(chunkD1.id, Anchor.Before);
    expect(p2.rightChar()!.view()).toBe('4');
    p2.nextId(0);
    expect(p2.rightChar()!.view()).toBe('4');
  });

  test('returns undefined, when at start of str', () => {
    const {peritext} = setupWithChunkedText();
    const point = peritext.pointAbsStart();
    expect(point.prevId()).toBe(undefined);
  });

  test('returns undefined, when at first char', () => {
    const {peritext} = setupWithChunkedText();
    const point1 = peritext.pointAt(0, Anchor.Before);
    const point2 = peritext.pointAt(0, Anchor.After);
    expect(point1.prevId()).toBe(undefined);
    expect(point2.prevId()).toBe(undefined);
  });

  test('returns last char, when at end of str', () => {
    const {peritext} = setupWithChunkedText();
    const point1 = peritext.pointAbsEnd();
    const point2 = peritext.pointAt(9, Anchor.Before);
    const id = point1.prevId();
    expect(id).toEqual(point2.id);
  });
});

describe('.leftChar()', () => {
  test('returns the left character', () => {
    const model = Model.withLogicalClock(123456);
    model.api.root({
      text: 'abc',
      slices: [],
      data: {},
    });
    const str = model.api.str(['text']).node;
    const peritext = new Peritext(model, str, model.api.arr(['slices']).node, model.api.obj(['data']));
    model.api.str(['text']).del(0, 3);
    model.api.str(['text']).ins(0, '00a1b2c3');
    model.api.str(['text']).del(0, 2);
    model.api.str(['text']).del(1, 1);
    model.api.str(['text']).del(2, 1);
    model.api.str(['text']).del(3, 1);
    const point0 = peritext.pointAt(2, Anchor.After);
    const char0 = point0.leftChar()!;
    expect(char0.chunk.data!.slice(char0.off, char0.off + 1)).toBe('c');
    const point1 = peritext.pointAt(1, Anchor.After);
    const char1 = point1.leftChar()!;
    expect(char1.chunk.data!.slice(char1.off, char1.off + 1)).toBe('b');
    const point2 = peritext.pointAt(0, Anchor.After);
    const char2 = point2.leftChar()!;
    expect(char2.chunk.data!.slice(char2.off, char2.off + 1)).toBe('a');
  });

  test('multi-char chunks with deletes', () => {
    const {peritext} = setupWithText();
    const res = '012345678';
    const start = peritext.pointAt(0, Anchor.Before);
    expect(start.leftChar()).toBe(undefined);
    const start2 = peritext.pointAt(0, Anchor.After);
    expect(start2.leftChar()!.view()).toBe(res[0]);
    const start3 = peritext.pointAt(1, Anchor.Before);
    const slice = start3.leftChar();
    expect(slice!.view()).toBe(res[0]);
    for (let i = 1; i < res.length; i++) {
      const point = peritext.pointAt(i, Anchor.Before);
      const char = point.leftChar()!;
      expect(char.view()).toBe(res[i - 1]);
    }
    for (let i = 0; i < res.length; i++) {
      const point = peritext.pointAt(i, Anchor.After);
      const char = point.leftChar()!;
      expect(char.view()).toBe(res[i]);
    }
  });

  test('multi-char chunks with deletes (2)', () => {
    const {peritext} = setupWithChunkedText();
    const res = '123456789';
    const start = peritext.pointAt(0, Anchor.Before);
    expect(start.leftChar()).toBe(undefined);
    const start2 = peritext.pointAt(0, Anchor.After);
    expect(start2.leftChar()!.view()).toBe(res[0]);
    const start3 = peritext.pointAt(1, Anchor.Before);
    const slice = start3.leftChar();
    expect(slice!.view()).toBe(res[0]);
    for (let i = 1; i < res.length; i++) {
      const point = peritext.pointAt(i, Anchor.Before);
      const char = point.leftChar()!;
      expect(char.view()).toBe(res[i - 1]);
    }
    for (let i = 0; i < res.length; i++) {
      const point = peritext.pointAt(i, Anchor.After);
      const char = point.leftChar()!;
      expect(char.view()).toBe(res[i]);
    }
  });

  test('retrieves left char of a deleted point', () => {
    const {peritext, chunkD1, chunkD2} = setupWithChunkedText();
    const p1 = peritext.point(chunkD1.id, Anchor.Before);
    expect(p1.leftChar()!.view()).toBe('3');
    const p2 = peritext.point(chunkD1.id, Anchor.After);
    expect(p2.leftChar()!.view()).toBe('3');
    const p3 = peritext.point(chunkD2.id, Anchor.Before);
    expect(p3.leftChar()!.view()).toBe('6');
    const p4 = peritext.point(chunkD2.id, Anchor.After);
    expect(p4.leftChar()!.view()).toBe('6');
  });

  test('at end of text should return the last char', () => {
    const {peritext} = setupWithChunkedText();
    const p1 = peritext.pointAt(8, Anchor.After);
    const p2 = peritext.pointAbsEnd();
    expect(p1.leftChar()!.view()).toBe('9');
    expect(p2.leftChar()!.view()).toBe('9');
  });
});

describe('.rightChar()', () => {
  test('returns the right character', () => {
    const model = Model.withLogicalClock(123456);
    model.api.root({
      text: 'abc',
      slices: [],
      data: {},
    });
    const str = model.api.str(['text']).node;
    const peritext = new Peritext(model, str, model.api.arr(['slices']).node, model.api.obj(['data']));
    const point0 = peritext.pointAt(0);
    const char0 = point0.rightChar()!;
    expect(char0.chunk.data!.slice(char0.off, char0.off + 1)).toBe('a');
    const point1 = peritext.pointAt(1);
    const char1 = point1.rightChar()!;
    expect(char1.chunk.data!.slice(char1.off, char1.off + 1)).toBe('b');
    const point2 = peritext.pointAt(2);
    const char2 = point2.rightChar()!;
    expect(char2.chunk.data!.slice(char2.off, char2.off + 1)).toBe('c');
  });

  test('multi-char chunks with deletes', () => {
    const {peritext} = setupWithText();
    const res = '012345678';
    for (let i = 0; i < res.length; i++) {
      const point = peritext.pointAt(i, Anchor.Before);
      const char = point.rightChar()!;
      expect(char.view()).toBe(res[i]);
    }
    for (let i = 0; i < res.length - 1; i++) {
      const point = peritext.pointAt(i, Anchor.After);
      const char = point.rightChar()!;
      expect(char.view()).toBe(res[i + 1]);
    }
    const end = peritext.pointAt(res.length - 1, Anchor.After);
    expect(end.rightChar()).toBe(undefined);
  });

  test('multi-char chunks with deletes (2)', () => {
    const {peritext} = setupWithChunkedText();
    const res = '123456789';
    for (let i = 0; i < res.length; i++) {
      const point = peritext.pointAt(i, Anchor.Before);
      const char = point.rightChar()!;
      expect(char.view()).toBe(res[i]);
    }
    for (let i = 0; i < res.length - 1; i++) {
      const point = peritext.pointAt(i, Anchor.After);
      const char = point.rightChar()!;
      expect(char.view()).toBe(res[i + 1]);
    }
    const end = peritext.pointAt(res.length - 1, Anchor.After);
    expect(end.rightChar()).toBe(undefined);
  });

  test('retrieves right char of a deleted point', () => {
    const {peritext, chunkD1, chunkD2} = setupWithChunkedText();
    const p1 = peritext.point(chunkD1.id, Anchor.Before);
    expect(p1.rightChar()!.view()).toBe('4');
    const p2 = peritext.point(chunkD1.id, Anchor.After);
    expect(p2.rightChar()!.view()).toBe('4');
    const p3 = peritext.point(chunkD2.id, Anchor.Before);
    expect(p3.rightChar()!.view()).toBe('7');
    const p4 = peritext.point(chunkD2.id, Anchor.After);
    expect(p4.rightChar()!.view()).toBe('7');
  });

  test('at start of text should return the first char', () => {
    const {peritext} = setupWithChunkedText();
    const p1 = peritext.pointAt(0, Anchor.Before);
    const p2 = peritext.pointAbsStart();
    expect(p1.rightChar()!.view()).toBe('1');
    expect(p2.rightChar()!.view()).toBe('1');
  });
});

describe('.isAbsStart()', () => {
  test('returns true if is start of string', () => {
    const {peritext} = setupWithChunkedText();
    const p1 = peritext.pointAbsStart();
    const p2 = peritext.pointAt(0, Anchor.Before);
    expect(p1.isAbsStart()).toBe(true);
    expect(p2.isAbsStart()).toBe(false);
  });
});

describe('.isAbsEnd()', () => {
  test('returns true if is end of string', () => {
    const {peritext} = setupWithChunkedText();
    const p1 = peritext.pointAbsEnd();
    const p2 = peritext.pointAt(8, Anchor.After);
    expect(p1.isAbsEnd()).toBe(true);
    expect(p2.isAbsEnd()).toBe(false);
  });
});

describe('.isRelStart()', () => {
  test('returns true only for relative start', () => {
    const {peritext} = setupWithChunkedText();
    const p1 = peritext.pointAbsStart();
    const id = peritext.str.find(0)!;
    const p2 = peritext.point(id, Anchor.Before);
    const p3 = peritext.point(id, Anchor.After);
    expect(p1.isRelStart()).toBe(false);
    expect(p2.isRelStart()).toBe(true);
    expect(p3.isRelStart()).toBe(false);
  });
});

describe('.isRelEnd()', () => {
  test('returns true only for relative start', () => {
    const {peritext} = setupWithChunkedText();
    const p1 = peritext.pointAbsEnd();
    const id = peritext.str.find(peritext.str.length() - 1)!;
    const p2 = peritext.point(id, Anchor.Before);
    const p3 = peritext.point(id, Anchor.After);
    expect(p1.isRelEnd()).toBe(false);
    expect(p2.isRelEnd()).toBe(false);
    expect(p3.isRelEnd()).toBe(true);
  });
});

describe('.refAbsStart()', () => {
  test('attaches to the absolute start', () => {
    const {peritext} = setupWithChunkedText();
    const p1 = peritext.pointAt(2, Anchor.After);
    p1.refAbsStart();
    expect(p1.viewPos()).toBe(0);
    expect(p1.id.sid).toBe(peritext.str.id.sid);
    expect(p1.id.time).toBe(peritext.str.id.time);
    expect(p1.anchor).toBe(Anchor.After);
  });
});

describe('.refAbsEnd()', () => {
  test('attaches to the absolute end', () => {
    const {peritext} = setupWithChunkedText();
    const p1 = peritext.pointAt(2, Anchor.After);
    p1.refAbsEnd();
    expect(p1.viewPos()).toBe(peritext.str.length());
    expect(p1.id.sid).toBe(peritext.str.id.sid);
    expect(p1.id.time).toBe(peritext.str.id.time);
    expect(p1.anchor).toBe(Anchor.Before);
  });
});

describe('.refStart()', () => {
  test('attaches to the relative start', () => {
    const {peritext} = setupWithChunkedText();
    const p1 = peritext.pointAt(2, Anchor.After);
    p1.refStart();
    expect(p1.viewPos()).toBe(0);
    const id = peritext.str.find(0)!;
    expect(p1.id.sid).toBe(id.sid);
    expect(p1.id.time).toBe(id.time);
    expect(p1.anchor).toBe(Anchor.Before);
  });
});

describe('.refEnd()', () => {
  test('attaches to the relative end', () => {
    const {peritext} = setupWithChunkedText();
    const p1 = peritext.pointAt(2, Anchor.After);
    p1.refEnd();
    expect(p1.viewPos()).toBe(peritext.str.length());
    const id = peritext.str.find(peritext.str.length() - 1)!;
    expect(p1.id.sid).toBe(id.sid);
    expect(p1.id.time).toBe(id.time);
    expect(p1.anchor).toBe(Anchor.After);
  });
});

describe('.refBefore()', () => {
  test('goes to next character, when anchor is switched', () => {
    const {peritext} = setupWithChunkedText();
    const p1 = peritext.pointAt(0, Anchor.After);
    expect(p1.rightChar()!.view()).toBe('2');
    const p2 = p1.clone();
    p2.refBefore();
    expect(p2.rightChar()!.view()).toBe('2');
    expect(p1.anchor).toBe(Anchor.After);
    expect(p2.anchor).toBe(Anchor.Before);
    expect(p1.id.time + 1).toBe(p2.id.time);
  });

  test('skips deleted chars', () => {
    const {peritext} = setupWithChunkedText();
    const p1 = peritext.pointAt(2, Anchor.After);
    expect(p1.rightChar()!.view()).toBe('4');
    const p2 = p1.clone();
    p2.refBefore();
    expect(p2.rightChar()!.view()).toBe('4');
    expect(p1.anchor).toBe(Anchor.After);
    expect(p2.anchor).toBe(Anchor.Before);
    expect(p1.id.time).not.toBe(p2.id.time);
  });

  test('when on last character, attaches to end of str', () => {
    const {peritext} = setupWithChunkedText();
    const p1 = peritext.pointAt(8, Anchor.After);
    expect(p1.leftChar()!.view()).toBe('9');
    const p2 = p1.clone();
    p2.refBefore();
    expect(p2.isAbsEnd()).toBe(true);
  });

  test('when relative end, attaches to absolute end', () => {
    const {peritext} = setupWithChunkedText();
    const p1 = peritext.pointAt(8, Anchor.After);
    expect(p1.leftChar()!.view()).toBe('9');
    const p2 = p1.clone();
    p2.refBefore();
    expect(p2.isAbsEnd()).toBe(true);
  });

  test('when absolute start, attaches to the first character', () => {
    const {peritext} = setup();
    const chunk1 = peritext.str.first()!;
    const absoluteStart = peritext.pointAbsStart();
    const start = peritext.point(chunk1.id, Anchor.Before);
    expect(absoluteStart.cmpSpatial(start) < 0).toBe(true);
    absoluteStart.refBefore();
    expect(absoluteStart.cmpSpatial(start) === 0).toBe(true);
  });
});

describe('.refAfter()', () => {
  test('goes to next character, when anchor is switched', () => {
    const {peritext} = setupWithChunkedText();
    const p1 = peritext.pointAt(4, Anchor.Before);
    expect(p1.leftChar()!.view()).toBe('4');
    const p2 = p1.clone();
    p2.refAfter();
    expect(p2.leftChar()!.view()).toBe('4');
    expect(p1.anchor).toBe(Anchor.Before);
    expect(p2.anchor).toBe(Anchor.After);
    expect(p1.id.time - 1).toBe(p2.id.time);
  });

  test('skips deleted chars', () => {
    const {peritext} = setupWithChunkedText();
    const p1 = peritext.pointAt(7, Anchor.Before);
    expect(p1.leftChar()!.view()).toBe('7');
    const p2 = p1.clone();
    p2.refAfter();
    expect(p2.leftChar()!.view()).toBe('7');
    expect(p1.anchor).toBe(Anchor.Before);
    expect(p2.anchor).toBe(Anchor.After);
    expect(p2.chunk()!.del).toBe(false);
  });

  test('when relative start, attaches to absolute start', () => {
    const {peritext} = setupWithChunkedText();
    const p1 = peritext.pointAt(0, Anchor.Before);
    expect(p1.rightChar()!.view()).toBe('1');
    const p2 = p1.clone();
    p2.refAfter();
    expect(p2.isAbsStart()).toBe(true);
  });

  test('when absolute end, attaches to last char', () => {
    const {peritext} = setup();
    const chunk1 = peritext.str.first()!;
    const id = tick(chunk1.id, 2);
    const absoluteEnd = peritext.pointAbsEnd();
    const end = peritext.point(id, Anchor.After);
    expect(absoluteEnd.cmpSpatial(end) > 0).toBe(true);
    absoluteEnd.refAfter();
    expect(absoluteEnd.cmpSpatial(end) === 0).toBe(true);
  });

  test('when absolute end, attaches to last visible char', () => {
    const {peritext} = setup();
    const chunk1 = peritext.str.first()!;
    const absoluteEnd = peritext.pointAbsEnd();
    const end1 = peritext.point(tick(chunk1.id, 1), Anchor.After);
    const end2 = peritext.point(tick(chunk1.id, 2), Anchor.After);
    peritext.strApi().del(2, 1);
    expect(end1.cmpSpatial(end2) < 0).toBe(true);
    expect(absoluteEnd.cmpSpatial(end2) > 0).toBe(true);
    end2.refAfter();
    absoluteEnd.refAfter();
    expect(end2.cmpSpatial(end1) === 0).toBe(true);
    expect(absoluteEnd.cmpSpatial(end1) === 0).toBe(true);
  });
});

describe('.refVisible()', () => {
  test('skips deleted chars, attaches to visible char', () => {
    const {peritext} = setupWithChunkedText();
    peritext.strApi().del(0, peritext.str.length());
    peritext.strApi().ins(0, '123456789');
    const mid1 = peritext.pointAt(4, Anchor.After);
    const mid2 = peritext.pointAt(5, Anchor.Before);
    expect(mid1.leftChar()!.view()).toBe('5');
    expect(mid1.rightChar()!.view()).toBe('6');
    expect(mid2.leftChar()!.view()).toBe('5');
    expect(mid2.rightChar()!.view()).toBe('6');
    const left = peritext.pointAt(2, Anchor.After);
    expect(left.leftChar()!.view()).toBe('3');
    const right = peritext.pointAt(6, Anchor.Before);
    expect(right.rightChar()!.view()).toBe('7');
    peritext.strApi().del(3, 3);
    expect(left.leftChar()!.view()).toBe('3');
    expect(right.rightChar()!.view()).toBe('7');
    expect(mid1.cmp(left) > 0).toBe(true);
    mid1.refVisible();
    expect(mid1.cmp(left) === 0).toBe(true);
    expect(mid2.cmp(right) < 0).toBe(true);
    mid2.refVisible();
    expect(mid2.cmp(right) === 0).toBe(true);
  });
});

describe('.step()', () => {
  test('smoke test', () => {
    const {peritext} = setupWithChunkedText();
    const p = peritext.pointAt(1, Anchor.After);
    expect(p.viewPos()).toBe(2);
    p.step(1);
    expect(p.viewPos()).toBe(3);
    p.step(2);
    expect(p.viewPos()).toBe(5);
    p.step(2);
    expect(p.viewPos()).toBe(7);
    p.step(-3);
    expect(p.viewPos()).toBe(4);
    p.step(-3);
    expect(p.viewPos()).toBe(1);
    p.step(-3);
    expect(p.viewPos()).toBe(0);
  });

  test('can reach the end of str', () => {
    const {peritext} = setupWithChunkedText();
    const p = peritext.pointAt(0, Anchor.After);
    p.step(1);
    p.step(2);
    p.step(3);
    p.step(4);
    p.step(5);
    p.step(6);
    expect(p.isAbsEnd()).toBe(true);
    expect(p.viewPos()).toBe(9);
    expect(p.leftChar()!.view()).toBe('9');
    expect(p.anchor).toBe(Anchor.Before);
  });

  test('can reach the start of str', () => {
    const {peritext} = setupWithChunkedText();
    const p = peritext.pointAt(8, Anchor.Before);
    p.step(-22);
    expect(p.isAbsStart()).toBe(true);
    expect(p.viewPos()).toBe(0);
    expect(p.rightChar()!.view()).toBe('1');
    expect(p.anchor).toBe(Anchor.After);
  });

  test('can move forward, when anchor = Before', () => {
    const {peritext, model} = setupWithChunkedText();
    model.api.str(['text']).del(4, 1);
    const txt = '12346789';
    for (let i = 0; i < txt.length - 1; i++) {
      const p = peritext.pointAt(i, Anchor.Before);
      expect(p.pos()).toBe(i);
      for (let j = i + 1; j < txt.length - 1; j++) {
        const p2 = p.clone();
        p2.step(j - i);
        expect(p2.pos()).toBe(j);
        expect(p2.anchor).toBe(Anchor.Before);
        expect(p2.rightChar()!.view()).toBe(txt[j]);
      }
    }
  });

  test('can move forward, when anchor = After', () => {
    const {peritext, model} = setupWithChunkedText();
    model.api.str(['text']).del(4, 1);
    const txt = '12346789';
    for (let i = 0; i < txt.length - 1; i++) {
      const p = peritext.pointAt(i, Anchor.After);
      expect(p.pos()).toBe(i);
      expect(p.leftChar()!.view()).toBe(txt[i]);
      for (let j = i + 1; j < txt.length - 1; j++) {
        const p2 = p.clone();
        p2.step(j - i);
        expect(p2.pos()).toBe(j);
        expect(p2.anchor).toBe(Anchor.After);
        expect(p2.leftChar()!.view()).toBe(txt[j]);
      }
    }
  });

  test('can move backward, when anchor = Before', () => {
    const {peritext, model} = setupWithChunkedText();
    model.api.str(['text']).del(4, 1);
    const txt = '12346789';
    for (let i = txt.length - 1; i > 0; i--) {
      const p = peritext.pointAt(i, Anchor.Before);
      expect(p.viewPos()).toBe(i);
      for (let j = i - 1; j > 0; j--) {
        const p2 = p.clone();
        p2.step(j - i);
        expect(p2.pos()).toBe(j);
        expect(p2.anchor).toBe(Anchor.Before);
        expect(p2.rightChar()!.view()).toBe(txt[j]);
      }
    }
  });
});

describe('.halfstep()', () => {
  test('smoke test', () => {
    const {peritext} = setupWithChunkedText();
    const p = peritext.pointAt(1, Anchor.After);
    expect(p.viewPos()).toBe(2);
    p.halfstep(1);
    expect(p.viewPos()).toBe(2);
    p.halfstep(2);
    expect(p.viewPos()).toBe(3);
    p.halfstep(2);
    expect(p.viewPos()).toBe(4);
    p.halfstep(-5);
    expect(p.viewPos()).toBe(2);
    p.halfstep(-1);
    expect(p.viewPos()).toBe(1);
  });

  test('can reach the end of str', () => {
    const {peritext} = setupWithChunkedText();
    const p = peritext.pointAt(0, Anchor.After);
    const endReached =
      p.halfstep(1) || p.halfstep(2) || p.halfstep(3) || p.halfstep(4) || p.halfstep(5) || p.halfstep(6);
    expect(endReached).toBe(true);
    expect(p.isAbsEnd()).toBe(true);
    expect(p.viewPos()).toBe(9);
    expect(p.leftChar()!.view()).toBe('9');
    expect(p.anchor).toBe(Anchor.Before);
  });

  test('can reach the start of str', () => {
    const {peritext} = setupWithChunkedText();
    const p = peritext.pointAt(8, Anchor.Before);
    const isEnd = p.halfstep(-22);
    expect(isEnd).toBe(true);
    expect(p.isAbsStart()).toBe(true);
    expect(p.viewPos()).toBe(0);
    expect(p.rightChar()!.view()).toBe('1');
    expect(p.anchor).toBe(Anchor.After);
  });

  test('can walk forward through all points', () => {
    const {peritext, model} = setupWithChunkedText();
    model.api.str(['text']).del(4, 1);
    const view = model.api.str(['text']).view();
    const points: Point[] = [];
    let point: Point | undefined = peritext.pointAbsStart();
    while (point) {
      const nextPoint = point.clone();
      const endReached = nextPoint.halfstep(1);
      if (endReached) {
        point = undefined;
      } else {
        points.push(nextPoint);
        point = nextPoint;
      }
    }
    for (let i = 0; i < view.length - 1; i++) {
      expect(points[i * 2].viewPos()).toBe(i);
      expect(points[i * 2].rightChar()?.view()).toBe(view[i]);
      expect(points[i * 2].anchor).toBe(Anchor.Before);
      expect(points[i * 2 + 1].leftChar()?.view()).toBe(view[i]);
      expect(points[i * 2 + 1].anchor).toBe(Anchor.After);
    }
  });

  test('can walk backwards through all points', () => {
    const {peritext, model} = setupWithChunkedText();
    model.api.str(['text']).del(4, 1);
    const view = model.api.str(['text']).view().split('').reverse().join('');
    const points: Point[] = [];
    let point: Point | undefined = peritext.pointAbsEnd();
    while (point) {
      const nextPoint = point.clone();
      const endReached = nextPoint.halfstep(-1);
      if (endReached) {
        point = undefined;
      } else {
        points.push(nextPoint);
        point = nextPoint;
      }
    }
    for (let i = view.length - 1; i >= 0; i--) {
      expect(points[i * 2].leftChar()?.view()).toBe(view[i]);
      expect(points[i * 2].anchor).toBe(Anchor.After);
      expect(points[i * 2 + 1].rightChar()?.view()).toBe(view[i]);
      expect(points[i * 2 + 1].anchor).toBe(Anchor.Before);
    }
  });
});
