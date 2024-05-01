import {Model} from '../../../../json-crdt/model';
import {first, next} from 'sonic-forest/lib/util';
import {Peritext} from '../../Peritext';
import {Anchor} from '../../rga/constants';
import {MarkerOverlayPoint} from '../MarkerOverlayPoint';

const setup = () => {
  const model = Model.withLogicalClock();
  model.api.root({
    text: '',
    slices: [],
    markers: [],
  });
  model.api.str(['text']).ins(0, 'wworld');
  model.api.str(['text']).ins(0, 'helo ');
  model.api.str(['text']).ins(2, 'l');
  model.api.str(['text']).del(7, 1);
  const peritext = new Peritext(model, model.api.str(['text']).node, model.api.arr(['slices']).node);
  return {model, peritext};
};

const markerCount = (peritext: Peritext): number => {
  const overlay = peritext.overlay;
  const iterator = overlay.splitIterator();
  let count = 0;
  for (let split = iterator(); split; split = iterator()) {
    count++;
  }
  return count;
};

describe('markers', () => {
  describe('inserts', () => {
    test('overlays starts with no markers', () => {
      const {peritext} = setup();
      expect(markerCount(peritext)).toBe(0);
    });

    test('can insert one marker in the middle of text', () => {
      const {peritext} = setup();
      peritext.editor.cursor.setAt(6);
      peritext.editor.insMarker(['p'], '¶');
      expect(markerCount(peritext)).toBe(0);
      peritext.overlay.refresh();
      expect(markerCount(peritext)).toBe(1);
      const points = [];
      let point;
      for (const iterator = peritext.overlay.iterator(); (point = iterator()); ) points.push(point);
      // console.log(peritext + '');
      expect(points.length).toBe(2);
      point = points[0];
      expect(point.pos()).toBe(5);
    });

    test('can insert two markers', () => {
      const {peritext} = setup();
      peritext.editor.cursor.setAt(3);
      peritext.editor.insMarker(['p'], '¶');
      expect(markerCount(peritext)).toBe(0);
      peritext.overlay.refresh();
      expect(markerCount(peritext)).toBe(1);
      peritext.overlay.refresh();
      expect(markerCount(peritext)).toBe(1);
      peritext.editor.cursor.setAt(9);
      peritext.editor.insMarker(['li'], '- ');
      expect(markerCount(peritext)).toBe(1);
      peritext.overlay.refresh();
      expect(markerCount(peritext)).toBe(2);
      peritext.overlay.refresh();
      expect(markerCount(peritext)).toBe(2);
    });
  });

  describe('deletes', () => {
    test('can delete a marker', () => {
      const {peritext} = setup();
      peritext.editor.cursor.setAt(6);
      const slice = peritext.editor.insMarker(['p'], '¶');
      peritext.refresh();
      expect(markerCount(peritext)).toBe(1);
      const points = [];
      let point;
      for (const iterator = peritext.overlay.iterator(); (point = iterator()); ) points.push(point);
      point = points[0];
      peritext.delMarker(slice);
      peritext.refresh();
      expect(markerCount(peritext)).toBe(0);
    });

    test('can delete one of two splits', () => {
      const {peritext} = setup();
      peritext.editor.cursor.setAt(2);
      peritext.editor.insMarker(['p'], '¶');
      peritext.editor.cursor.setAt(11);
      const slice = peritext.editor.insMarker(['p'], '¶');
      peritext.refresh();
      expect(markerCount(peritext)).toBe(2);
      const points = [];
      let point;
      for (const iterator = peritext.overlay.iterator(); (point = iterator()); ) points.push(point);
      point = points[0];
      peritext.delMarker(slice);
      peritext.refresh();
      expect(markerCount(peritext)).toBe(1);
    });
  });

  describe('iterates', () => {
    test('can iterate over markers', () => {
      const {peritext} = setup();
      peritext.editor.cursor.setAt(1, 6);
      peritext.editor.insStackSlice('a', {a: 'b'});
      peritext.editor.cursor.setAt(2);
      peritext.editor.insMarker(['p'], '¶');
      peritext.editor.cursor.setAt(11);
      peritext.editor.insMarker(['p'], '¶');
      peritext.refresh();
      expect(markerCount(peritext)).toBe(2);
      const points = [];
      let point;
      for (const iterator = peritext.overlay.splitIterator(); (point = iterator()); ) points.push(point);
      expect(points.length).toBe(2);
      expect(points[0].pos()).toBe(2);
      expect(points[1].pos()).toBe(11);
    });
  });
});

describe('slices', () => {
  describe('inserts', () => {
    test('overlays starts with no slices', () => {
      const {peritext} = setup();
      expect(peritext.overlay.slices.size).toBe(0);
    });

    test('can insert one slice in the middle of text', () => {
      const {peritext} = setup();
      peritext.editor.cursor.setAt(6, 2);
      peritext.editor.insStackSlice('em', {emphasis: true});
      expect(peritext.overlay.slices.size).toBe(0);
      peritext.overlay.refresh();
      expect(peritext.overlay.slices.size).toBe(2);
      const points = [];
      let point;
      for (const iterator = peritext.overlay.iterator(); (point = iterator()); ) points.push(point);
      expect(points.length).toBe(2);
      expect(points[0].pos()).toBe(6);
      expect(points[0].anchor).toBe(Anchor.Before);
      expect(points[1].pos()).toBe(7);
      expect(points[1].anchor).toBe(Anchor.After);
    });

    test('can insert two slices', () => {
      const {peritext} = setup();
      peritext.editor.cursor.setAt(2, 8);
      peritext.editor.insStackSlice('em', {emphasis: true});
      peritext.editor.cursor.setAt(4, 8);
      peritext.editor.insStackSlice('strong', {bold: true});
      expect(peritext.overlay.slices.size).toBe(0);
      peritext.overlay.refresh();
      expect(peritext.overlay.slices.size).toBe(3);
      const points = [];
      let point;
      for (const iterator = peritext.overlay.iterator(); (point = iterator()); ) points.push(point);
      expect(points.length).toBe(4);
    });

    test('intersecting slice chunks point to two slices', () => {
      const {peritext} = setup();
      peritext.editor.cursor.setAt(2, 2);
      peritext.editor.insStackSlice('em', {emphasis: true});
      peritext.editor.cursor.setAt(3, 2);
      peritext.editor.insStackSlice('strong', {bold: true});
      peritext.refresh();
      const point1 = first(peritext.overlay.root)!;
      expect(point1.layers.length).toBe(1);
      expect(point1.layers[0].data()).toStrictEqual({emphasis: true});
      const point2 = next(point1)!;
      expect(point2.layers.length).toBe(3);
      expect(point2.layers[0].data()).toStrictEqual(undefined);
      expect(point2.layers[1].data()).toStrictEqual({emphasis: true});
      expect(point2.layers[2].data()).toStrictEqual({bold: true});
      const point3 = next(point2)!;
      expect(point3.layers.length).toBe(2);
      expect(point3.layers[0].data()).toStrictEqual(undefined);
      expect(point3.layers[1].data()).toStrictEqual({bold: true});
      const point4 = next(point3)!;
      expect(point4.layers.length).toBe(0);
    });

    test('one char slice should correctly sort overlay points', () => {
      const {peritext} = setup();
      peritext.editor.cursor.setAt(0, 1);
      peritext.editor.insStackSlice('em', {emphasis: true});
      peritext.refresh();
      const point1 = peritext.overlay.first()!;
      const point2 = next(point1)!;
      expect(point1.pos()).toBe(0);
      expect(point2.pos()).toBe(0);
      expect(point1.anchor).toBe(Anchor.Before);
      expect(point2.anchor).toBe(Anchor.After);
    });

    test('intersecting slice before split, should not update the split', () => {
      const {peritext} = setup();
      peritext.editor.cursor.setAt(6);
      const slice = peritext.editor.insMarker(['p']);
      peritext.refresh();
      const point = peritext.overlay.find((point) => point instanceof MarkerOverlayPoint)!;
      expect(point.layers.length).toBe(0);
      peritext.editor.cursor.setAt(2, 2);
      peritext.editor.insStackSlice('<i>');
      peritext.refresh();
      expect(point.layers.length).toBe(0);
      peritext.editor.cursor.setAt(2, 1);
      peritext.editor.insStackSlice('<b>');
      peritext.refresh();
      expect(point.layers.length).toBe(0);
    });
  });

  describe('deletes', () => {
    test('can remove a slice', () => {
      const {peritext} = setup();
      peritext.editor.cursor.setAt(6, 2);
      const slice = peritext.editor.insStackSlice('em', {emphasis: true});
      expect(peritext.overlay.slices.size).toBe(0);
      peritext.overlay.refresh();
      expect(peritext.overlay.slices.size).toBe(2);
      peritext.savedSlices.del(slice.id);
      expect(peritext.overlay.slices.size).toBe(2);
      peritext.overlay.refresh();
      expect(peritext.overlay.slices.size).toBe(1);
    });
  });
});
