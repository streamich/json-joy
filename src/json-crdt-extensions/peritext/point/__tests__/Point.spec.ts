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
