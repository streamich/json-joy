import {next} from 'sonic-forest/lib/util';
import {
  type Kit,
  setupNumbersKit,
  setupNumbersWithMultipleChunksAndDeletesKit,
  setupNumbersWithRgaSplitKit,
  setupNumbersWithTombstonesKit,
  setupNumbersWithTwoChunksKit,
} from '../../__tests__/setup';
import {Anchor} from '../../rga/constants';
import type {OverlayPoint} from '../OverlayPoint';

const runPairsTests = (setup: () => Kit) => {
  describe('.pairs() full range', () => {
    test('returns [undef, undef] single pair for an empty overlay', () => {
      const {peritext} = setup();
      const overlay = peritext.overlay;
      overlay.refresh();
      const pairs = [...overlay.pairs()];
      expect(pairs).toEqual([[undefined, undefined]]);
    });

    test('when caret at abs start, returns one pair', () => {
      const {peritext} = setup();
      const overlay = peritext.overlay;
      peritext.editor.cursor.set(peritext.pointAbsStart());
      overlay.refresh();
      const pairs = [...overlay.pairs()];
      const p1 = overlay.first()!;
      expect(peritext.editor.cursor.start.rightChar()?.view()).toBe('0');
      expect(pairs).toEqual([[p1, undefined]]);
    });

    test('when caret at abs end, returns one pair', () => {
      const {peritext} = setup();
      const overlay = peritext.overlay;
      peritext.editor.cursor.set(peritext.pointAbsEnd());
      overlay.refresh();
      const pairs = [...overlay.pairs()];
      const p1 = overlay.first()!;
      expect(peritext.editor.cursor.start.leftChar()?.view()).toBe('9');
      expect(pairs).toEqual([[undefined, p1]]);
    });

    test('for only caret in overlay, returns two edge pairs', () => {
      const {peritext} = setup();
      const overlay = peritext.overlay;
      peritext.editor.cursor.setAt(5);
      overlay.refresh();
      const pairs = [...overlay.pairs()];
      const p1 = overlay.first()!;
      expect(peritext.editor.cursor.start.leftChar()?.view()).toBe('4');
      expect(pairs).toEqual([
        [undefined, p1],
        [p1, undefined],
      ]);
    });

    test('for a cursor selection, returns three pairs', () => {
      const {peritext} = setup();
      const overlay = peritext.overlay;
      peritext.editor.cursor.setAt(3, 3);
      overlay.refresh();
      const pairs = [...overlay.pairs()];
      const p1 = overlay.first()!;
      const p2 = next(p1)!;
      expect(peritext.editor.cursor.text()).toBe('345');
      expect(pairs).toEqual([
        [undefined, p1],
        [p1, p2],
        [p2, undefined],
      ]);
    });

    test('for a cursor selection at abs start, returns two pairs', () => {
      const {peritext} = setup();
      const overlay = peritext.overlay;
      const range = peritext.range(peritext.pointAbsStart(), peritext.pointAt(5));
      peritext.editor.cursor.setRange(range);
      overlay.refresh();
      const pairs = [...overlay.pairs()];
      const p1 = overlay.first()!;
      const p2 = next(p1)!;
      expect(peritext.editor.cursor.text()).toBe('01234');
      expect(pairs).toEqual([
        [p1, p2],
        [p2, undefined],
      ]);
    });

    test('for a cursor selection at abs end, returns two pairs', () => {
      const {peritext} = setup();
      const overlay = peritext.overlay;
      const range = peritext.range(peritext.pointAt(5, Anchor.Before), peritext.pointAbsEnd());
      peritext.editor.cursor.setRange(range);
      overlay.refresh();
      const pairs = [...overlay.pairs()];
      const p1 = overlay.first()!;
      const p2 = next(p1)!;
      expect(peritext.editor.cursor.text()).toBe('56789');
      expect(pairs).toEqual([
        [undefined, p1],
        [p1, p2],
      ]);
    });

    test('for a marker and a slice after the marker, returns 4 pairs', () => {
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
      const pairs = [...overlay.pairs()];
      expect(peritext.editor.cursor.text()).toBe('56');
      expect(pairs).toEqual([
        [undefined, p1],
        [p1, p2],
        [p2, p3],
        [p3, undefined],
      ]);
      expect(p1.isMarker()).toBe(true);
      expect(!p2.isMarker()).toBe(true);
      expect(!p3.isMarker()).toBe(true);
      expect((p1 as OverlayPoint).marker).toBe(marker);
      expect(p2.layers.length).toBe(2);
      expect(p3.layers.length).toBe(0);
      expect(p2.refs.length).toBe(2);
      expect(p3.refs.length).toBe(2);
    });
  });

  describe('.pairs() at offset', () => {
    test('in empty overlay, after caret returns the last edge', () => {
      const {peritext} = setup();
      const overlay = peritext.overlay;
      peritext.editor.cursor.setAt(5);
      overlay.refresh();
      const first = overlay.first()!;
      const pairs = [...overlay.pairs(first)];
      expect(pairs).toEqual([[first, undefined]]);
    });

    test('in empty overlay, after selection start returns the selection and the edge', () => {
      const {peritext} = setup();
      const overlay = peritext.overlay;
      peritext.editor.cursor.setAt(2, 4);
      overlay.refresh();
      const p1 = overlay.first()!;
      const p2 = next(p1)!;
      const list = [...overlay.pairs(p1)];
      expect(list).toEqual([
        [p1, p2],
        [p2, undefined],
      ]);
    });
  });
};

describe('numbers "0123456789", no edits', () => {
  runPairsTests(setupNumbersKit);
});

describe('numbers "0123456789", with default schema and tombstones', () => {
  runPairsTests(setupNumbersWithTombstonesKit);
});

describe('numbers "0123456789", two RGA chunks', () => {
  runPairsTests(setupNumbersWithTwoChunksKit);
});

describe('numbers "0123456789", with RGA split', () => {
  runPairsTests(setupNumbersWithRgaSplitKit);
});

describe('numbers "0123456789", with multiple deletes', () => {
  runPairsTests(setupNumbersWithMultipleChunksAndDeletesKit);
});
