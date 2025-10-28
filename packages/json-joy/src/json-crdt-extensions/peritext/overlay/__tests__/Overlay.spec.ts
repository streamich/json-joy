import {Model} from '../../../../json-crdt/model';
import {first, next, size} from 'sonic-forest/lib/util';
import {Peritext} from '../../Peritext';
import {Anchor} from '../../rga/constants';

const setup = () => {
  const model = Model.create();
  model.api.set({
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
  const iterator = overlay.markers0(void 0);
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
      peritext.editor.saved.insMarker(['p'], '¶');
      expect(markerCount(peritext)).toBe(0);
      peritext.overlay.refresh();
      expect(markerCount(peritext)).toBe(1);
      const points = [...peritext.overlay.points()];
      expect(points.length).toBe(2);
      expect(points[0].pos()).toBe(5);
    });

    test('can insert two markers', () => {
      const {peritext} = setup();
      peritext.editor.cursor.setAt(3);
      peritext.editor.saved.insMarker(['p'], '¶');
      expect(markerCount(peritext)).toBe(0);
      peritext.overlay.refresh();
      expect(markerCount(peritext)).toBe(1);
      peritext.overlay.refresh();
      expect(markerCount(peritext)).toBe(1);
      peritext.editor.cursor.setAt(9);
      peritext.editor.saved.insMarker(['li'], '- ');
      expect(markerCount(peritext)).toBe(1);
      peritext.overlay.refresh();
      expect(markerCount(peritext)).toBe(2);
      peritext.overlay.refresh();
      expect(markerCount(peritext)).toBe(2);
    });

    test('does reference cursor, when marker and cursor are at the same position', () => {
      const {peritext} = setup();
      peritext.editor.cursor.setAt(3);
      const [marker] = peritext.editor.saved.insMarker(['p'], '¶');
      peritext.editor.cursor.set(marker.start.clone());
      peritext.overlay.refresh();
      const overlayMarkerPoint = peritext.overlay.root2!;
      expect(overlayMarkerPoint.isMarker()).toBe(true);
      expect(overlayMarkerPoint.markers.length).toBe(2);
      expect(overlayMarkerPoint.markers.find((m) => m === peritext.editor.cursor)).toBe(peritext.editor.cursor);
    });
  });

  describe('deletes', () => {
    test('can delete a marker', () => {
      const {peritext} = setup();
      peritext.editor.cursor.setAt(6);
      const [slice] = peritext.editor.saved.insMarker(['p'], '¶');
      peritext.refresh();
      expect(markerCount(peritext)).toBe(1);
      peritext.editor.delMarker(slice);
      peritext.refresh();
      expect(markerCount(peritext)).toBe(0);
    });

    test('can delete one of two splits', () => {
      const {peritext} = setup();
      peritext.editor.cursor.setAt(2);
      peritext.editor.saved.insMarker(['p'], '¶');
      peritext.editor.cursor.setAt(11);
      const [slice] = peritext.editor.saved.insMarker(['p'], '¶');
      peritext.refresh();
      expect(markerCount(peritext)).toBe(2);
      peritext.editor.delMarker(slice);
      peritext.refresh();
      expect(markerCount(peritext)).toBe(1);
    });
  });

  describe('iterates', () => {
    test('can iterate over markers', () => {
      const {peritext} = setup();
      peritext.editor.cursor.setAt(1, 6);
      peritext.editor.saved.insStack('a', {a: 'b'});
      peritext.editor.cursor.setAt(2);
      peritext.editor.saved.insMarker(['p'], '¶');
      peritext.editor.cursor.setAt(11);
      peritext.editor.saved.insMarker(['p'], '¶');
      peritext.refresh();
      expect(markerCount(peritext)).toBe(2);
      const points = [];
      let point: any;
      for (const iterator = peritext.overlay.markers0(void 0); (point = iterator()); ) points.push(point);
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
      peritext.editor.saved.insStack('em', {emphasis: true});
      expect(size(peritext.overlay.root)).toBe(0);
      peritext.overlay.refresh();
      expect(size(peritext.overlay.root)).toBe(2);
      const points = [...peritext.overlay.points()];
      expect(points.length).toBe(2);
      expect(points[0].pos()).toBe(6);
      expect(points[0].anchor).toBe(Anchor.Before);
      expect(points[1].pos()).toBe(7);
      expect(points[1].anchor).toBe(Anchor.After);
    });

    test('can insert two slices', () => {
      const {peritext} = setup();
      peritext.editor.cursor.setAt(2, 8);
      peritext.editor.saved.insStack('em', {emphasis: true});
      peritext.editor.cursor.setAt(4, 8);
      peritext.editor.saved.insStack('strong', {bold: true});
      expect(size(peritext.overlay.root)).toBe(0);
      peritext.overlay.refresh();
      expect(size(peritext.overlay.root)).toBe(4);
      const points = [...peritext.overlay.points()];
      expect(points.length).toBe(4);
    });

    test('can insert a slice, which is collapsed to a point', () => {
      const {peritext} = setup();
      peritext.editor.cursor.setAt(3);
      const [slice] = peritext.editor.saved.insStack('em', {emphasis: true});
      peritext.overlay.refresh();
      const [point] = [...peritext.overlay.points()];
      expect(point.layers.length).toBe(0);
      expect(point.markers.length).toBe(2);
      expect(point.markers.find((m) => m === peritext.editor.cursor)).toBe(peritext.editor.cursor);
      expect(point.markers.find((m) => m === slice)).toBe(slice);
    });

    test('intersecting slice chunks point to two slices', () => {
      const {peritext} = setup();
      peritext.editor.cursor.setAt(2, 2);
      peritext.editor.saved.insStack('em', {emphasis: true});
      peritext.editor.cursor.setAt(3, 2);
      peritext.editor.saved.insStack('strong', {bold: true});
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
      peritext.editor.saved.insStack('em', {emphasis: true});
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
      peritext.editor.saved.insMarker(['p']);
      peritext.refresh();
      const point = peritext.overlay.find((point) => point.isMarker())!;
      expect(point.layers.length).toBe(0);
      peritext.editor.cursor.setAt(2, 2);
      peritext.editor.saved.insStack('<i>');
      peritext.refresh();
      expect(point.layers.length).toBe(0);
      peritext.editor.cursor.setAt(2, 1);
      peritext.editor.saved.insStack('<b>');
      peritext.refresh();
      expect(point.layers.length).toBe(0);
    });
  });

  describe('deletes', () => {
    test('can remove a slice', () => {
      const {peritext} = setup();
      peritext.editor.cursor.setAt(6, 2);
      const [slice] = peritext.editor.saved.insStack('em', {emphasis: true});
      expect(peritext.overlay.slices.size).toBe(0);
      peritext.overlay.refresh();
      expect(size(peritext.overlay.root)).toBe(2);
      peritext.savedSlices.del(slice.id);
      expect(size(peritext.overlay.root)).toBe(2);
      peritext.overlay.refresh();
      expect(size(peritext.overlay.root)).toBe(2);
      peritext.editor.delCursors();
      peritext.overlay.refresh();
      expect(size(peritext.overlay.root)).toBe(0);
    });
  });
});
