import {last, next} from 'sonic-forest/lib/util';
import {Model} from '../../../../json-crdt/model';
import {Peritext} from '../../Peritext';
import type {OverlayPoint} from '../OverlayPoint';

const setup = () => {
  const model = Model.create();
  const api = model.api;
  api.root({
    text: '',
    slices: [],
    data: {},
  });
  api.str(['text']).ins(0, 'wworld');
  api.str(['text']).ins(0, 'helo ');
  api.str(['text']).ins(2, 'l');
  api.str(['text']).del(7, 1);
  const peritext = new Peritext(model, api.str(['text']).node, api.arr(['slices']).node, api.obj(['data']));
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

describe('.points()', () => {
  describe('with overlay', () => {
    test('iterates through all points', () => {
      const {peritext} = setupWithOverlay();
      const overlay = peritext.overlay;
      const points = [...overlay.points()];
      expect(overlay.first()).not.toBe(undefined);
      expect(points.length).toBe(3);
    });

    test('iterates through all points, when points anchored to the same anchor', () => {
      const {peritext, overlay} = setupWithOverlay();
      peritext.refresh();
      expect([...overlay.points()].length).toBe(3);
      peritext.editor.cursor.setAt(2, 1);
      peritext.editor.saved.insStack('<b>');
      peritext.refresh();
      expect([...overlay.points()].length).toBe(4);
      expect(overlay.first()).not.toBe(undefined);
    });

    test('should not return virtual start point, if real start point exists', () => {
      const {peritext, overlay} = setup();
      peritext.editor.cursor.setAt(0);
      peritext.editor.saved.insMarker(['p'], '¶');
      peritext.refresh();
      const points = [...overlay.points()];
      expect(points.length).toBe(2);
      expect(overlay.first()).toBe(points[0]);
    });

    test('should not return virtual end point, if real end point exists', () => {
      const {peritext, overlay} = setup();
      peritext.editor.cursor.setAt(0, peritext.strApi().view().length);
      peritext.editor.saved.insStack('bold');
      peritext.refresh();
      const points = [...overlay.points()];
      expect(points.length).toBe(2);
      expect(overlay.first()).toBe(points[0]);
      expect(last(overlay.root)).toBe(points[1]);
    });

    test('can skip points from beginning', () => {
      const {overlay} = setupWithOverlay();
      overlay.refresh();
      const points1 = [...overlay.points()];
      expect(points1.length).toBe(3);
      const first = overlay.first()!;
      const points2 = [...overlay.points(first)];
      expect(points2.length).toBe(2);
      const second = next(first)!;
      const points3 = [...overlay.points(second)];
      expect(points3.length).toBe(1);
      const third = next(second);
      const points4 = [...overlay.points(third)];
      expect(points4.length).toBe(0);
    });

    test('can skip the last real point', () => {
      const {overlay} = setupWithOverlay();
      overlay.refresh();
      expect([...overlay.points()].length).toBe(3);
      const lastPoint = last(overlay.root!);
      const points: OverlayPoint<any>[] = [];
      for (const point of overlay.points()) {
        if (point === lastPoint) break;
        points.push(point);
      }
      expect(points.length).toBe(2);
    });
  });
});
