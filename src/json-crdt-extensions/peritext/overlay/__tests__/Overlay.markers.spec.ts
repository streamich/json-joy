import {Kit, setupNumbersKit, setupNumbersWithTombstonesKit} from '../../__tests__/setup';
import {MarkerOverlayPoint} from '../MarkerOverlayPoint';

const runMarkersTests = (setup: () => Kit) => {
  describe('.markers()', () => {
    test('returns empty set by default', () => {
      const {peritext} = setup();
      peritext.overlay.refresh();
      const list = [...peritext.overlay.markers()];
      expect(list.length).toBe(0);
    });

    test('returns a single marker', () => {
      const {peritext, editor} = setup();
      editor.cursor.setAt(3);
      editor.saved.insMarker('<paragraph>');
      peritext.overlay.refresh();
      const list = [...peritext.overlay.markers()];
      expect(list.length).toBe(1);
      expect(list[0] instanceof MarkerOverlayPoint).toBe(true);
    });

    test('can iterate through multiple markers', () => {
      const {peritext, editor} = setup();
      editor.cursor.setAt(5);
      const [m2] = editor.saved.insMarker('<p2>');
      peritext.overlay.refresh();
      editor.cursor.setAt(8);
      const [m3] = editor.local.insMarker('<p3>');
      peritext.overlay.refresh();
      editor.cursor.setAt(2);
      const [m1] = editor.local.insMarker('<p1>');
      peritext.overlay.refresh();
      const list = [...peritext.overlay.markers()];
      expect(list.length).toBe(3);
      list.forEach(m => expect(m instanceof MarkerOverlayPoint).toBe(true));
      expect(list[0].marker).toBe(m1);
      expect(list[1].marker).toBe(m2);
      expect(list[2].marker).toBe(m3);
    });

    test('can delete markers', () => {
      const {peritext, editor} = setup();
      editor.cursor.setAt(5);
      const [m2] = editor.extra.insMarker('<p2>');
      editor.cursor.setAt(8);
      const [m3] = editor.local.insMarker('<p3>');
      editor.cursor.setAt(2);
      const [m1] = editor.local.insMarker('<p1>');
      peritext.overlay.refresh();
      const list = [...peritext.overlay.markers()];
      expect(list.length).toBe(3);
      editor.local.del(m3);
      peritext.overlay.refresh();
      const list2 = [...peritext.overlay.markers()];
      expect(list2.length).toBe(2);
      expect(list2[0].marker).toBe(m1);
      expect(list2[1].marker).toBe(m2);
      editor.local.del(m2);
      peritext.overlay.refresh();
      const list3 = [...peritext.overlay.markers()];
      expect(list3.length).toBe(2);
      expect(list3[0].marker).toBe(m1);
      expect(list3[1].marker).toBe(m2);
      editor.extra.del(m2);
      peritext.overlay.refresh();
      const list4 = [...peritext.overlay.markers()];
      expect(list4.length).toBe(1);
      expect(list4[0].marker).toBe(m1);
      editor.local.del(m1);
      editor.local.del(m1);
      editor.local.del(m1);
      peritext.overlay.refresh();
      expect([...peritext.overlay.markers()].length).toBe(0);
    });

    test('can add marker at the start of text', () => {
      const {peritext, editor} = setup();
      editor.cursor.setAt(0);
      const [marker] = editor.extra.insMarker(0);
      peritext.overlay.refresh();
      const list = [...peritext.overlay.markers()];
      expect(list.length).toBe(1);
      expect(list[0].marker).toBe(marker);
      editor.extra.del(marker);
      peritext.overlay.refresh();
      expect([...peritext.overlay.markers()].length).toBe(0);
    });
    
    test('can add marker at the end of text', () => {
      const {peritext, editor} = setup();
      editor.cursor.set(peritext.pointEnd()!);
      const [marker] = editor.extra.insMarker('0');
      peritext.overlay.refresh();
      const list = [...peritext.overlay.markers()];
      expect(list.length).toBe(1);
      expect(list[0].marker).toBe(marker);
      editor.extra.del(marker);
      peritext.overlay.refresh();
      expect([...peritext.overlay.markers()].length).toBe(0);
    });
  });
};

describe('numbers "0123456789", no edits', () => {
  runMarkersTests(setupNumbersKit);
});

describe('numbers "0123456789", with default schema and tombstones', () => {
  runMarkersTests(setupNumbersWithTombstonesKit);
});
