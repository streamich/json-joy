import {next} from 'sonic-forest/lib/util';
import {type Kit, setupHelloWorldKit, setupHelloWorldWithFewEditsKit} from '../../__tests__/setup';
import {Anchor} from '../../rga/constants';
import {MarkerOverlayPoint} from '../MarkerOverlayPoint';
import {OverlayPoint} from '../OverlayPoint';

const runPairsTests = (setup: () => Kit) => {
  describe('.tuples() full range', () => {
    test('returns [START, END] single tuple for an empty overlay', () => {
      const {peritext} = setup();
      const overlay = peritext.overlay;
      peritext.editor.delCursors();
      overlay.refresh();
      const list = [...overlay.tuples()];
      expect(list).toEqual([[overlay.START, overlay.END]]);
    });

    test('when caret at abs start, returns one [p, END] tuple', () => {
      const {peritext} = setup();
      const overlay = peritext.overlay;
      peritext.editor.cursor.set(peritext.pointAbsStart());
      overlay.refresh();
      const list = [...overlay.tuples()];
      const p1 = overlay.first()!;
      expect(peritext.editor.cursor.start.rightChar()?.view()).toBe(peritext.strApi().view()[0]);
      expect(list).toEqual([[p1, overlay.END]]);
    });

    test('when caret at abs end, returns one [START, p] tuple', () => {
      const {peritext} = setup();
      const overlay = peritext.overlay;
      peritext.editor.cursor.set(peritext.pointAbsEnd());
      overlay.refresh();
      const list = [...overlay.tuples()];
      const p1 = overlay.first()!;
      expect(peritext.editor.cursor.start.leftChar()?.view()).toBe(peritext.strApi().view().slice(-1));
      expect(list).toEqual([[overlay.START, p1]]);
    });

    test('for only caret in overlay, returns two edge tuples', () => {
      const {peritext} = setup();
      const overlay = peritext.overlay;
      peritext.editor.cursor.setAt(5);
      overlay.refresh();
      const list = [...overlay.tuples()];
      const p1 = overlay.first()!;
      expect(peritext.editor.cursor.start.leftChar()?.view()).toBe(peritext.strApi().view()[4]);
      expect(list).toEqual([
        [overlay.START, p1],
        [p1, overlay.END],
      ]);
    });

    test('for a cursor selection, returns three tuples', () => {
      const {peritext} = setup();
      const overlay = peritext.overlay;
      peritext.editor.cursor.setAt(3, 3);
      overlay.refresh();
      const list = [...overlay.tuples()];
      const p1 = overlay.first()!;
      const p2 = next(p1)!;
      expect(peritext.editor.cursor.text()).toBe(peritext.strApi().view().slice(3, 6));
      expect(list).toEqual([
        [overlay.START, p1],
        [p1, p2],
        [p2, overlay.END],
      ]);
    });

    test('for a cursor selection at abs start, returns two tuples', () => {
      const {peritext} = setup();
      const overlay = peritext.overlay;
      const range = peritext.range(peritext.pointAbsStart(), peritext.pointAt(5));
      peritext.editor.cursor.setRange(range);
      overlay.refresh();
      const list = [...overlay.tuples()];
      const p1 = overlay.first()!;
      const p2 = next(p1)!;
      expect(list).toEqual([
        [p1, p2],
        [p2, overlay.END],
      ]);
    });

    test('for a cursor selection at abs end, returns two tuples', () => {
      const {peritext} = setup();
      const overlay = peritext.overlay;
      const range = peritext.range(peritext.pointAt(5, Anchor.Before), peritext.pointAbsEnd());
      peritext.editor.cursor.setRange(range);
      overlay.refresh();
      const list = [...overlay.tuples()];
      const p1 = overlay.first()!;
      const p2 = next(p1)!;
      expect(list).toEqual([
        [overlay.START, p1],
        [p1, p2],
      ]);
    });

    test('for a marker and a slice after the marker, returns 4 tuples', () => {
      const {peritext} = setup();
      const {editor, overlay} = peritext;
      editor.cursor.setAt(3);
      const [marker] = editor.saved.insMarker('<paragraph>');
      editor.cursor.setAt(6, 2);
      editor.extra.insStack('<b>');
      overlay.refresh();
      const p1 = overlay.first()!;
      const p2 = next(p1)!;
      const p3 = next(p2)!;
      const list = [...overlay.tuples()];
      expect(list).toEqual([
        [overlay.START, p1],
        [p1, p2],
        [p2, p3],
        [p3, overlay.END],
      ]);
      expect(p1 instanceof MarkerOverlayPoint).toBe(true);
      expect(p2 instanceof OverlayPoint).toBe(true);
      expect(p3 instanceof OverlayPoint).toBe(true);
      expect((p1 as MarkerOverlayPoint).marker).toBe(marker);
      expect(p2.layers.length).toBe(2);
      expect(p3.layers.length).toBe(0);
      expect(p2.refs.length).toBe(2);
      expect(p3.refs.length).toBe(2);
    });
  });

  describe('.tuples() at offset', () => {
    test('in empty overlay, after caret returns the last edge', () => {
      const {peritext} = setup();
      const overlay = peritext.overlay;
      peritext.editor.cursor.setAt(5);
      overlay.refresh();
      const first = overlay.first()!;
      const pairs = [...overlay.tuples(first)];
      expect(pairs).toEqual([[first, overlay.END]]);
    });

    test('in empty overlay, after selection start returns the selection and the edge', () => {
      const {peritext} = setup();
      const overlay = peritext.overlay;
      peritext.editor.cursor.setAt(2, 4);
      overlay.refresh();
      const p1 = overlay.first()!;
      const p2 = next(p1)!;
      const list = [...overlay.tuples(p1)];
      expect(list).toEqual([
        [p1, p2],
        [p2, overlay.END],
      ]);
    });
  });
};

describe('text "hello world", no edits', () => {
  runPairsTests(setupHelloWorldKit);
});

describe('text "hello world", with few edits', () => {
  runPairsTests(setupHelloWorldWithFewEditsKit);
});
