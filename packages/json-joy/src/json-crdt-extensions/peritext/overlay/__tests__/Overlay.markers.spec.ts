import {UndEndIterator} from '../../../../util/iterator';
import {type Kit, runNumbersKitTestSuite} from '../../__tests__/setup';
import type {Point} from '../../rga/Point';
import {OverlayPoint} from '../OverlayPoint';

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
      expect(list[0].isMarker()).toBe(true);
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
      for (const m of list) expect(m.isMarker()).toBe(true);
      expect(list[0].markers[0]).toBe(m1);
      expect(list[1].markers[0]).toBe(m2);
      expect(list[2].markers[0]).toBe(m3);
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

  describe('.markersFrom0()', () => {
    test('returns empty set by default', () => {
      const {peritext} = setup();
      peritext.overlay.refresh();
      const point = peritext.pointAt(3);
      const list = [...new UndEndIterator(peritext.overlay.markersFrom0(point))];
      expect(list.length).toBe(0);
    });

    test('returns a single marker (when point equals marker position)', () => {
      const {peritext, editor} = setup();
      editor.cursor.setAt(3);
      editor.saved.insMarker('<paragraph>');
      peritext.overlay.refresh();
      const point = peritext.pointAt(3);
      const list = [...new UndEndIterator(peritext.overlay.markersFrom0(point))];
      expect(list.length).toBe(1);
      expect(list[0].isMarker()).toBe(true);
    });

    test('returns a single marker (when point is before marker position)', () => {
      const {peritext, editor} = setup();
      editor.cursor.setAt(3);
      editor.saved.insMarker('<paragraph>');
      peritext.overlay.refresh();
      const point = peritext.pointAt(1);
      const list = [...new UndEndIterator(peritext.overlay.markersFrom0(point))];
      expect(list.length).toBe(1);
      expect(list[0].isMarker()).toBe(true);
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
      const point = peritext.pointAt(1);
      const list = [...new UndEndIterator(peritext.overlay.markersFrom0(point))];
      expect(list.length).toBe(3);
      for (const m of list) expect(m.isMarker()).toBe(true);
      expect(list[0].marker).toBe(m1);
      expect(list[1].marker).toBe(m2);
      expect(list[2].marker).toBe(m3);
    });

    test('can iterate through multiple markers (ABS start as starting point)', () => {
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
      const point = peritext.pointAbsStart();
      const list = [...new UndEndIterator(peritext.overlay.markersFrom0(point))];
      expect(list.length).toBe(3);
      for (const m of list) expect(m.isMarker()).toBe(true);
      expect(list[0].marker).toBe(m1);
      expect(list[1].marker).toBe(m2);
      expect(list[2].marker).toBe(m3);
    });

    test('can add marker at the REL start of text', () => {
      const {peritext, editor} = setup();
      editor.cursor.setAt(0);
      const [marker] = editor.extra.insMarker(0);
      peritext.overlay.refresh();
      const point = peritext.pointAbsStart();
      const list = [...new UndEndIterator(peritext.overlay.markersFrom0(point))];
      expect(list.length).toBe(1);
      expect(list[0].marker).toBe(marker);
      editor.extra.del(marker);
      peritext.overlay.refresh();
      expect([...peritext.overlay.markers()].length).toBe(0);
    });

    test('can add marker at the ABS start of text', () => {
      const {peritext, editor} = setup();
      editor.cursor.set(peritext.pointAbsStart());
      const [marker] = editor.extra.insMarker(0);
      peritext.overlay.refresh();
      const point = peritext.pointAbsStart();
      const list = [...new UndEndIterator(peritext.overlay.markersFrom0(point))];
      expect(list.length).toBe(1);
      expect(list[0].markers[0]).toBe(marker);
      editor.extra.del(marker);
      peritext.overlay.refresh();
      expect([...peritext.overlay.markers()].length).toBe(0);
    });

    test('can add marker at the REL end of text', () => {
      const {peritext, editor} = setup();
      editor.cursor.set(peritext.pointEnd()!);
      const [marker] = editor.extra.insMarker('0');
      peritext.overlay.refresh();
      const point = peritext.pointAt(1);
      const list = [...new UndEndIterator(peritext.overlay.markersFrom0(point))];
      expect(list.length).toBe(1);
      expect(list[0].marker).toBe(marker);
      editor.extra.del(marker);
      peritext.overlay.refresh();
      expect([...peritext.overlay.markers()].length).toBe(0);
    });

    test('can add marker at the ABS end of text', () => {
      const {peritext, editor} = setup();
      editor.cursor.set(peritext.pointAbsEnd());
      const [marker] = editor.extra.insMarker('0');
      peritext.overlay.refresh();
      const point = peritext.pointAt(1);
      const list = [...new UndEndIterator(peritext.overlay.markersFrom0(point))];
      expect(list.length).toBe(1);
      expect(list[0].marker).toBe(marker);
      editor.extra.del(marker);
      peritext.overlay.refresh();
      expect([...peritext.overlay.markers()].length).toBe(0);
    });
  });

  describe('.markerPairs0()', () => {
    describe('no markers', () => {
      test('starting point in string', () => {
        const {peritext} = setup();
        peritext.overlay.refresh();
        const point = peritext.pointAt(3);
        const iterator = peritext.overlay.markerPairs0(point);
        const list = [...new UndEndIterator(iterator)];
        expect(list.length).toBe(1);
        expect(list[0]).toEqual([undefined, undefined]);
      });

      test('starting point ABS start', () => {
        const {peritext} = setup();
        peritext.overlay.refresh();
        const point = peritext.pointAbsStart();
        const iterator = peritext.overlay.markerPairs0(point);
        const list = [...new UndEndIterator(iterator)];
        expect(list.length).toBe(1);
        expect(list[0]).toEqual([undefined, undefined]);
      });

      test('starting point and ending point in string', () => {
        const {peritext} = setup();
        peritext.overlay.refresh();
        const start = peritext.pointAt(2);
        const end = peritext.pointAt(4);
        const iterator = peritext.overlay.markerPairs0(start, end);
        const list = [...new UndEndIterator(iterator)];
        expect(list.length).toBe(1);
        expect(list[0]).toEqual([undefined, undefined]);
      });

      test('starting point and ending point in string, and the same', () => {
        const {peritext} = setup();
        peritext.overlay.refresh();
        const start = peritext.pointAt(2);
        const end = peritext.pointAt(2);
        const iterator = peritext.overlay.markerPairs0(start, end);
        const list = [...new UndEndIterator(iterator)];
        expect(list.length).toBe(1);
        expect(list[0]).toEqual([undefined, undefined]);
      });

      test('ending point is ABS end', () => {
        const {peritext} = setup();
        peritext.overlay.refresh();
        const start = peritext.pointAt(2);
        const end = peritext.pointAbsEnd();
        const iterator = peritext.overlay.markerPairs0(start, end);
        const list = [...new UndEndIterator(iterator)];
        expect(list.length).toBe(1);
        expect(list[0]).toEqual([undefined, undefined]);
      });

      test('both endpoints are ABS', () => {
        const {peritext} = setup();
        peritext.overlay.refresh();
        const start = peritext.pointAbsStart();
        const end = peritext.pointAbsEnd();
        const iterator = peritext.overlay.markerPairs0(start, end);
        const list = [...new UndEndIterator(iterator)];
        expect(list.length).toBe(1);
        expect(list[0]).toEqual([undefined, undefined]);
      });

      test('both endpoints are ABS start', () => {
        const {peritext} = setup();
        peritext.overlay.refresh();
        const start = peritext.pointAbsStart();
        const end = peritext.pointAbsStart();
        const iterator = peritext.overlay.markerPairs0(start, end);
        const list = [...new UndEndIterator(iterator)];
        expect(list.length).toBe(1);
        expect(list[0]).toEqual([undefined, undefined]);
      });

      test('both endpoints are ABS end', () => {
        const {peritext} = setup();
        peritext.overlay.refresh();
        const start = peritext.pointAbsEnd();
        const end = peritext.pointAbsEnd();
        const iterator = peritext.overlay.markerPairs0(start, end);
        const list = [...new UndEndIterator(iterator)];
        expect(list.length).toBe(1);
        expect(list[0]).toEqual([undefined, undefined]);
      });
    });

    describe('one marker', () => {
      const create = () => {
        const kit = setup();
        kit.editor.cursor.setAt(5);
        kit.editor.saved.insMarker('<paragraph>');
        kit.peritext.overlay.refresh();
        return kit;
      };

      test('start before marker', () => {
        const {peritext} = create();
        const point = peritext.pointAt(1);
        const list = [...new UndEndIterator(peritext.overlay.markerPairs0(point))];
        expect(list.length).toBe(2);
        expect(list[0][0]).toBe(undefined);
        expect(list[0][1]).toBeInstanceOf(OverlayPoint);
        expect(list[0][1]?.isMarker()).toBe(true);
        expect(list[1][0]).toBeInstanceOf(OverlayPoint);
        expect(list[1][0]?.isMarker()).toBe(true);
        expect(list[1][1]).toBe(undefined);
        expect(list[0][1]).toBe(list[1][0]);
      });

      test('start point equals marker', () => {
        const {peritext} = create();
        const point = peritext.pointAt(5);
        const list = [...new UndEndIterator(peritext.overlay.markerPairs0(point))];
        expect(list.length).toBe(1);
        expect(list[0][0]).toBeInstanceOf(OverlayPoint);
        expect(list[0][0]?.isMarker()).toBe(true);
        expect(list[0][1]).toBe(undefined);
      });

      test('start point after marker', () => {
        const {peritext} = create();
        const point = peritext.pointAt(6);
        const list = [...new UndEndIterator(peritext.overlay.markerPairs0(point))];
        expect(list.length).toBe(1);
        expect(list[0][0]).toBe(undefined);
        expect(list[0][1]).toBe(undefined);
      });

      test('start and end points before marker', () => {
        const {peritext} = create();
        const start = peritext.pointAt(1);
        const end = peritext.pointAt(3);
        const iterator = peritext.overlay.markerPairs0(start, end);
        const list = [...new UndEndIterator(iterator)];
        expect(list.length).toBe(1);
        expect(list[0][0]).toBe(undefined);
        expect(list[0][1]).toBe(undefined);
      });

      test('start point before marker, end point after marker', () => {
        const {peritext} = create();
        const start = peritext.pointAt(2);
        const end = peritext.pointAt(7);
        const iterator = peritext.overlay.markerPairs0(start, end);
        const list = [...new UndEndIterator(iterator)];
        expect(list.length).toBe(2);
        expect(list[0][0]).toBe(undefined);
        expect(list[0][1]).toBeInstanceOf(OverlayPoint);
        expect(list[0][1]?.isMarker()).toBe(true);
        expect(list[1][0]).toBeInstanceOf(OverlayPoint);
        expect(list[1][0]?.isMarker()).toBe(true);
        expect(list[1][1]).toBe(undefined);
      });

      test('start at REL start, end point at REL end', () => {
        const {peritext} = create();
        const start = peritext.pointStart()!;
        const end = peritext.pointEnd()!;
        const iterator = peritext.overlay.markerPairs0(start, end);
        const list = [...new UndEndIterator(iterator)];
        expect(list.length).toBe(2);
        expect(list[0][0]).toBe(undefined);
        expect(list[0][1]).toBeInstanceOf(OverlayPoint);
        expect(list[0][1]?.isMarker()).toBe(true);
        expect(list[1][0]).toBeInstanceOf(OverlayPoint);
        expect(list[1][0]?.isMarker()).toBe(true);
        expect(list[1][1]).toBe(undefined);
      });

      test('start at ABS start, end point at ABS end', () => {
        const {peritext} = create();
        const start = peritext.pointAbsStart();
        const end = peritext.pointAbsEnd();
        const iterator = peritext.overlay.markerPairs0(start, end);
        const list = [...new UndEndIterator(iterator)];
        expect(list.length).toBe(2);
        expect(list[0][0]).toBe(undefined);
        expect(list[0][1]).toBeInstanceOf(OverlayPoint);
        expect(list[0][1]?.isMarker()).toBe(true);
        expect(list[1][0]).toBeInstanceOf(OverlayPoint);
        expect(list[1][0]?.isMarker()).toBe(true);
        expect(list[1][1]).toBe(undefined);
      });

      test('start and end points after marker', () => {
        const {peritext} = create();
        const start = peritext.pointAt(6);
        const end = peritext.pointAt(7);
        const iterator = peritext.overlay.markerPairs0(start, end);
        const list = [...new UndEndIterator(iterator)];
        expect(list.length).toBe(1);
        expect(list[0][0]).toBe(undefined);
        expect(list[0][1]).toBe(undefined);
      });

      test('start and end points after marker (collapsed at same point)', () => {
        const {peritext} = create();
        const start = peritext.pointAt(7);
        const end = peritext.pointAt(7);
        const iterator = peritext.overlay.markerPairs0(start, end);
        const list = [...new UndEndIterator(iterator)];
        expect(list.length).toBe(1);
        expect(list[0][0]).toBe(undefined);
        expect(list[0][1]).toBe(undefined);
      });

      test('start and end points before marker (collapsed at same point)', () => {
        const {peritext} = create();
        const start = peritext.pointAt(2);
        const end = peritext.pointAt(2);
        const iterator = peritext.overlay.markerPairs0(start, end);
        const list = [...new UndEndIterator(iterator)];
        expect(list.length).toBe(1);
        expect(list[0][0]).toBe(undefined);
        expect(list[0][1]).toBe(undefined);
      });

      test('start and end points exactly at marker (collapsed at same point)', () => {
        const {peritext} = create();
        const start = peritext.pointAt(5);
        const end = peritext.pointAt(5);
        const iterator = peritext.overlay.markerPairs0(start, end);
        const list = [...new UndEndIterator(iterator)];
        expect(list.length).toBe(1);
        expect(list[0][0]).toBeInstanceOf(OverlayPoint);
        expect(list[0][0]?.isMarker()).toBe(true);
        expect(list[0][1]).toBe(undefined);
      });

      test('start and end points exactly at ABS start', () => {
        const {peritext} = create();
        const start = peritext.pointAbsStart();
        const end = peritext.pointAbsStart();
        const iterator = peritext.overlay.markerPairs0(start, end);
        const list = [...new UndEndIterator(iterator)];
        expect(list.length).toBe(1);
        expect(list[0][0]).toBe(undefined);
        expect(list[0][1]).toBe(undefined);
      });

      test('start and end points exactly at REL start', () => {
        const {peritext} = create();
        const start = peritext.pointStart()!;
        const end = peritext.pointStart()!;
        const iterator = peritext.overlay.markerPairs0(start, end);
        const list = [...new UndEndIterator(iterator)];
        expect(list.length).toBe(1);
        expect(list[0][0]).toBe(undefined);
        expect(list[0][1]).toBe(undefined);
      });

      test('start and end points exactly at ABS end', () => {
        const {peritext} = create();
        const start = peritext.pointAbsEnd();
        const end = peritext.pointAbsEnd();
        const iterator = peritext.overlay.markerPairs0(start, end);
        const list = [...new UndEndIterator(iterator)];
        expect(list.length).toBe(1);
        expect(list[0][0]).toBe(undefined);
        expect(list[0][1]).toBe(undefined);
      });

      test('start and end points exactly at REL end', () => {
        const {peritext} = create();
        const start = peritext.pointEnd()!;
        const end = peritext.pointEnd()!;
        const iterator = peritext.overlay.markerPairs0(start, end);
        const list = [...new UndEndIterator(iterator)];
        expect(list.length).toBe(1);
        expect(list[0][0]).toBe(undefined);
        expect(list[0][1]).toBe(undefined);
      });
    });

    describe('multiple markers', () => {
      const create = (start: (kit: Kit) => Point, end?: (kit: Kit) => Point) => {
        const kit = setup();
        kit.editor.cursor.setAt(5);
        const [m2] = kit.editor.saved.insMarker('<p2>');
        kit.peritext.overlay.refresh();
        kit.editor.cursor.setAt(7);
        const [m3] = kit.editor.local.insMarker('<p3>');
        kit.peritext.overlay.refresh();
        kit.editor.cursor.setAt(3);
        const [m1] = kit.editor.local.insMarker('<p1>');
        kit.peritext.overlay.refresh();
        const iterator = kit.peritext.overlay.markerPairs0(start(kit), end?.(kit));
        const list = [...new UndEndIterator(iterator)];
        const markers = [...kit.peritext.overlay.markers()];
        return {...kit, m1, m2, m3, list, markers};
      };

      const assertAllPoints = (kit: ReturnType<typeof create>) => {
        const {list, markers} = kit;
        expect(list.length).toBe(4);
        expect(list[0][0]).toBe(undefined);
        expect(list[0][1]).toBe(markers[0]);
        expect(list[1][0]).toBe(markers[0]);
        expect(list[1][1]).toBe(markers[1]);
        expect(list[2][0]).toBe(markers[1]);
        expect(list[2][1]).toBe(markers[2]);
        expect(list[3][0]).toBe(markers[2]);
        expect(list[3][1]).toBe(undefined);
      };

      test('start before all markers', () => {
        const kit = create((kit) => kit.peritext.pointAt(1));
        assertAllPoints(kit);
      });

      test('start at ABS start', () => {
        const kit = create((kit) => kit.peritext.pointAbsStart());
        assertAllPoints(kit);
      });

      test('start at REL start', () => {
        const kit = create((kit) => kit.peritext.pointStart()!);
        assertAllPoints(kit);
      });

      test('start half-point before first marker', () => {
        const kit = create((kit) => {
          const point = kit.peritext.pointAt(3);
          point.halfstep(-1);
          return point;
        });
        assertAllPoints(kit);
      });

      test('end after all markers', () => {
        const kit = create(
          (kit) => kit.peritext.pointAt(1),
          (kit) => kit.peritext.pointAt(10),
        );
        assertAllPoints(kit);
      });

      test('end at ABS end', () => {
        const kit = create(
          (kit) => kit.peritext.pointAt(1),
          (kit) => kit.peritext.pointAbsEnd(),
        );
        assertAllPoints(kit);
      });

      test('end at REL end', () => {
        const kit = create(
          (kit) => kit.peritext.pointAt(1),
          (kit) => kit.peritext.pointEnd()!,
        );
        assertAllPoints(kit);
      });

      test('end half-point after last marker', () => {
        const kit = create(
          (kit) => kit.peritext.pointAbsStart(),
          (kit) => {
            const point = kit.peritext.pointAt(8);
            point.halfstep(1);
            return point;
          },
        );
        assertAllPoints(kit);
      });

      test('start and end at ABS endpoints', () => {
        const kit = create(
          (kit) => kit.peritext.pointAbsStart(),
          (kit) => kit.peritext.pointAbsEnd(),
        );
        assertAllPoints(kit);
      });

      test('start and end at REL endpoints', () => {
        const kit = create(
          (kit) => kit.peritext.pointStart()!,
          (kit) => kit.peritext.pointEnd()!,
        );
        assertAllPoints(kit);
      });

      test('start point past the first marker', () => {
        const {list, markers} = create((kit) => kit.peritext.pointAt(4));
        expect(list.length).toBe(3);
        expect(list[0][0]).toBe(undefined);
        expect(list[0][1]).toBe(markers[1]);
        expect(list[1][0]).toBe(markers[1]);
        expect(list[1][1]).toBe(markers[2]);
        expect(list[2][0]).toBe(markers[2]);
        expect(list[2][1]).toBe(undefined);
      });

      test('start point past the first marker, end point ahead of last marker', () => {
        const {list, markers} = create(
          (kit) => kit.peritext.pointAt(4),
          (kit) => {
            const point = kit.peritext.pointAt(7);
            return point;
          },
        );
        expect(list.length).toBe(2);
        expect(list[0][0]).toBe(undefined);
        expect(list[0][1]).toBe(markers[1]);
        expect(list[1][0]).toBe(markers[1]);
        expect(list[1][1]).toBe(undefined);
      });

      test('start point past the first marker, end point right on second marker', () => {
        const {list, markers} = create(
          (kit) => kit.peritext.pointAt(4),
          (kit) => {
            const end = kit.peritext.pointAt(6);
            return end;
          },
        );
        expect(list.length).toBe(1);
        expect(list[0][0]).toBe(undefined);
        expect(list[0][1]).toBe(markers[1]);
      });

      test('start point right on first maker, end point past the first marker', () => {
        const {list, markers} = create(
          (kit) => kit.peritext.pointAt(3),
          (kit) => kit.peritext.pointAt(4),
        );
        expect(list.length).toBe(1);
        expect(list[0][0]).toBe(markers[0]);
        expect(list[0][1]).toBe(undefined);
      });

      test('start point right on first maker, end point past the second marker', () => {
        const {list, markers} = create(
          (kit) => kit.peritext.pointAt(3),
          (kit) => kit.peritext.pointAt(7),
        );
        expect(list.length).toBe(2);
        expect(list[0][0]).toBe(markers[0]);
        expect(list[0][1]).toBe(markers[1]);
        expect(list[1][0]).toBe(markers[1]);
        expect(list[1][1]).toBe(undefined);
      });

      test('start point right on first maker, at REL end', () => {
        const {list, markers} = create(
          (kit) => kit.peritext.pointAt(3),
          (kit) => kit.peritext.pointEnd()!,
        );
        expect(list.length).toBe(3);
        expect(list[0][0]).toBe(markers[0]);
        expect(list[0][1]).toBe(markers[1]);
        expect(list[1][0]).toBe(markers[1]);
        expect(list[1][1]).toBe(markers[2]);
        expect(list[2][0]).toBe(markers[2]);
        expect(list[2][1]).toBe(undefined);
      });
    });
  });
};

runNumbersKitTestSuite(runMarkersTests);
