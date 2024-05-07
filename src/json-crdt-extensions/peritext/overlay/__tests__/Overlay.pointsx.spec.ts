import {last, next} from 'sonic-forest/lib/util';
import {Model} from '../../../../json-crdt/model';
import {Peritext} from '../../Peritext';
import {Point} from '../../rga/Point';
import {Anchor} from '../../rga/constants';
import {SliceBehavior} from '../../slice/constants';
import type {Overlay} from '../Overlay';
import type {OverlayPoint} from '../OverlayPoint';

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

describe('.points0()', () => {
  const getPoints = (overlay: Overlay, start?: OverlayPoint, end?: (next: OverlayPoint) => boolean) => {
    const points: OverlayPoint[] = [];
    overlay.points0(start, end, (point) => {
      points.push(point);
    });
    return points;
  };

  describe('with overlay', () => {
    test('iterates through all points', () => {
      const {peritext} = setupWithOverlay();
      const overlay = peritext.overlay;
      console.log(overlay + '');
      // const points = getPoints(overlay);
      // expect(overlay.first()).not.toBe(undefined);
      // expect(points.length).toBe(peritext.strApi().length());
    });

    test('iterates through all points, when points anchored to the same anchor', () => {
      const {peritext, overlay} = setupWithOverlay();
      peritext.editor.cursor.setAt(2, 1);
      peritext.editor.saved.insStack('<b>');
      peritext.refresh();
      const points = getPoints(overlay);
      expect(overlay.first()).not.toBe(undefined);
      expect(points.length).toBe(6);
    });

    test('should not return virtual start point, if real start point exists', () => {
      const {peritext, overlay} = setup();
      peritext.editor.cursor.setAt(0);
      peritext.editor.saved.insMarker(['p'], '¶');
      peritext.refresh();
      const points = getPoints(overlay);
      expect(points.length).toBe(2);
      expect(overlay.first()).toBe(points[0]);
    });

    test('should not return virtual end point, if real end point exists', () => {
      const {peritext, overlay} = setup();
      peritext.editor.cursor.setAt(0, peritext.strApi().view().length);
      peritext.editor.saved.insStack('bold');
      peritext.refresh();
      const points = getPoints(overlay);
      expect(points.length).toBe(2);
      expect(overlay.first()).toBe(points[0]);
      expect(last(overlay.root)).toBe(points[1]);
    });

    test('can skip points from beginning', () => {
      const {overlay} = setupWithOverlay();
      const points1 = getPoints(overlay);
      expect(points1.length).toBe(5);
      const first = overlay.first()!;
      const points2 = getPoints(overlay, first);
      expect(points2.length).toBe(4);
      const second = next(first)!;
      const points3 = getPoints(overlay, second);
      expect(points3.length).toBe(3);
      const third = next(second);
      const points4 = getPoints(overlay, third);
      expect(points4.length).toBe(2);
    });

    test('can skip last virtual point', () => {
      const {overlay} = setupWithOverlay();
      const points1 = getPoints(overlay);
      expect(points1.length).toBe(5);
      const points2 = getPoints(overlay, undefined, (point) => !point.refs.length);
      expect(points2.length).toBe(4);
    });

    test('can skip last real point', () => {
      const {overlay} = setupWithOverlay();
      const lastPoint = last(overlay.root!);
      const points1 = getPoints(overlay, undefined, (point) => point === lastPoint);
      expect(points1.length).toBe(3);
    });
  });
});

describe('.points1()', () => {
  const getSlices = (overlay: Overlay, start?: OverlayPoint, end?: (next: OverlayPoint) => boolean) => {
    const slices: [OverlayPoint, OverlayPoint][] = [];
    overlay.points1(start, end, (p1, p2) => {
      slices.push([p1, p2]);
    });
    return slices;
  };

  describe('when overlay is empty', () => {
    test('returns one interval that contains the whole string', () => {
      const {peritext, overlay} = setup();
      const slices = getSlices(overlay);
      expect(overlay.first()).toBe(undefined);
      expect(slices.length).toBe(1);
      expect(slices[0][0].id.time).toBe(peritext.str.first()!.id.time);
      expect(slices[0][1].id.time).toBe(peritext.str.last()!.id.time + peritext.str.last()!.span - 1);
      expect(slices[0][0].anchor).toBe(Anchor.Before);
      expect(slices[0][1].anchor).toBe(Anchor.After);
    });
  });

  describe('with overlay', () => {
    test('iterates through all slices', () => {
      const {overlay} = setupWithOverlay();
      const slices = getSlices(overlay);
      expect(overlay.first()).not.toBe(undefined);
      expect(slices.length).toBe(4);
    });

    test('iterates through all slices, when points anchored to the same anchor', () => {
      const {peritext, overlay} = setupWithOverlay();
      peritext.editor.cursor.setAt(2, 1);
      peritext.editor.saved.insStack('<b>');
      peritext.refresh();
      const slices = getSlices(overlay);
      expect(overlay.first()).not.toBe(undefined);
      expect(slices.length).toBe(5);
    });

    test('can skip the first slice', () => {
      const {overlay} = setupWithOverlay();
      const slices = getSlices(overlay, overlay.first());
      expect(slices.length).toBe(3);
    });

    test('can skip the last slice', () => {
      const {overlay} = setupWithOverlay();
      const slices = getSlices(overlay, overlay.first(), (point) => !point.refs.length);
      expect(slices.length).toBe(2);
    });

    test('can skip last two slices', () => {
      const {overlay} = setupWithOverlay();
      const lastPoint = last(overlay.root!);
      const slices = getSlices(overlay, overlay.first(), (point) => point === lastPoint);
      expect(slices.length).toBe(1);
    });

    test('handles case when cursor is at start of document', () => {
      const model = Model.withLogicalClock();
      const api = model.api;
      api.root({
        text: '',
        slices: [],
      });
      const peritext = new Peritext(model, api.str(['text']).node, api.arr(['slices']).node);
      peritext.overlay.refresh(true);
      peritext.insAt(0, '\n');
      peritext.overlay.refresh(true);
      peritext.insAt(0, 'abc xyz');
      peritext.overlay.refresh(true);
      peritext.savedSlices.ins(peritext.rangeAt(4, 3), SliceBehavior.Overwrite, 'bold');
      peritext.overlay.refresh(true);
      const points: [Point, Point][] = [];
      peritext.overlay.points1(undefined, undefined, (p1, p2) => {
        points.push([p1, p2]);
      });
      const first = peritext.overlay.first();
      const second = next(first!);
      const third = next(second!);
      const fourth = next(third!);
      expect(fourth).toBe(undefined);
      expect(points.length).toBe(3);
      expect(points[0][0]).toBe(first);
      expect(points[0][1]).toBe(second);
      expect(points[1][0]).toBe(second);
      expect(points[1][1]).toBe(third);
      expect(points[2][0]).toBe(third);
      expect(points[2][1].pos()).toBe(7);
      expect(points[2][1].anchor).toBe(Anchor.After);
    });
  });
});
