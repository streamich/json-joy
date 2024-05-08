import {next} from 'sonic-forest/lib/util';
import {Model} from '../../../../json-crdt/model';
import {Peritext} from '../../Peritext';

const setup = () => {
  const model = Model.withLogicalClock();
  const api = model.api;
  api.root({
    text: '',
    slices: [],
  });
  api.str(['text']).ins(0, 'wworld');
  api.str(['text']).ins(0, 'helo ');
  api.str(['text']).ins(2, 'l');
  api.str(['text']).del(7, 1);
  const peritext = new Peritext(model, api.str(['text']).node, api.arr(['slices']).node);
  const {overlay} = peritext;
  return {model, peritext, overlay};
};

const setupWithOverlay = () => {
  const res = setup();
  const peritext = res.peritext;
  peritext.editor.cursor.setAt(6);
  peritext.editor.saved.insMarker(['p'], '¶');
  peritext.editor.cursor.setAt(2, 2);
  peritext.editor.saved.insStack('<i>');
  peritext.refresh();
  return res;
};

describe('.pairs()', () => {
  test('all adjacent pairs', () => {
    const {peritext} = setupWithOverlay();
    const overlay = peritext.overlay;
    overlay.refresh();
    const pairs = [...overlay.pairs()];
    const p1 = overlay.first()!;
    const p2 = next(p1)!;
    const p3 = next(p2)!;
    expect(pairs.length).toBe(4);
    expect(pairs).toEqual([
      [undefined, p1],
      [p1, p2],
      [p2, p3],
      [p3, undefined],
    ]);
  });
});

// describe('.points1()', () => {
//   const getSlices = (overlay: Overlay, start?: OverlayPoint, end?: (next: OverlayPoint) => boolean) => {
//     const slices: [OverlayPoint, OverlayPoint][] = [];
//     overlay.points1(start, end, (p1, p2) => {
//       slices.push([p1, p2]);
//     });
//     return slices;
//   };

//   describe('when overlay is empty', () => {
//     test('returns one interval that contains the whole string', () => {
//       const {peritext, overlay} = setup();
//       const slices = getSlices(overlay);
//       expect(overlay.first()).toBe(undefined);
//       expect(slices.length).toBe(1);
//       expect(slices[0][0].id.time).toBe(peritext.str.first()!.id.time);
//       expect(slices[0][1].id.time).toBe(peritext.str.last()!.id.time + peritext.str.last()!.span - 1);
//       expect(slices[0][0].anchor).toBe(Anchor.Before);
//       expect(slices[0][1].anchor).toBe(Anchor.After);
//     });
//   });

//   describe('with overlay', () => {
//     test('iterates through all slices', () => {
//       const {overlay} = setupWithOverlay();
//       const slices = getSlices(overlay);
//       expect(overlay.first()).not.toBe(undefined);
//       expect(slices.length).toBe(4);
//     });

//     test('iterates through all slices, when points anchored to the same anchor', () => {
//       const {peritext, overlay} = setupWithOverlay();
//       peritext.editor.cursor.setAt(2, 1);
//       peritext.editor.saved.insStack('<b>');
//       peritext.refresh();
//       const slices = getSlices(overlay);
//       expect(overlay.first()).not.toBe(undefined);
//       expect(slices.length).toBe(5);
//     });

//     test('can skip the first slice', () => {
//       const {overlay} = setupWithOverlay();
//       const slices = getSlices(overlay, overlay.first());
//       expect(slices.length).toBe(3);
//     });

//     test('can skip the last slice', () => {
//       const {overlay} = setupWithOverlay();
//       const slices = getSlices(overlay, overlay.first(), (point) => !point.refs.length);
//       expect(slices.length).toBe(2);
//     });

//     test('can skip last two slices', () => {
//       const {overlay} = setupWithOverlay();
//       const lastPoint = last(overlay.root!);
//       const slices = getSlices(overlay, overlay.first(), (point) => point === lastPoint);
//       expect(slices.length).toBe(1);
//     });

//     test('handles case when cursor is at start of document', () => {
//       const model = Model.withLogicalClock();
//       const api = model.api;
//       api.root({
//         text: '',
//         slices: [],
//       });
//       const peritext = new Peritext(model, api.str(['text']).node, api.arr(['slices']).node);
//       peritext.overlay.refresh(true);
//       peritext.insAt(0, '\n');
//       peritext.overlay.refresh(true);
//       peritext.insAt(0, 'abc xyz');
//       peritext.overlay.refresh(true);
//       peritext.savedSlices.ins(peritext.rangeAt(4, 3), SliceBehavior.Overwrite, 'bold');
//       peritext.overlay.refresh(true);
//       const points: [Point, Point][] = [];
//       peritext.overlay.points1(undefined, undefined, (p1, p2) => {
//         points.push([p1, p2]);
//       });
//       const first = peritext.overlay.first();
//       const second = next(first!);
//       const third = next(second!);
//       const fourth = next(third!);
//       expect(fourth).toBe(undefined);
//       expect(points.length).toBe(3);
//       expect(points[0][0]).toBe(first);
//       expect(points[0][1]).toBe(second);
//       expect(points[1][0]).toBe(second);
//       expect(points[1][1]).toBe(third);
//       expect(points[2][0]).toBe(third);
//       expect(points[2][1].pos()).toBe(7);
//       expect(points[2][1].anchor).toBe(Anchor.After);
//     });
//   });
// });
