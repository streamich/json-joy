import {type Kit, runAlphabetKitTestSuite} from '../../__tests__/setup';

const statTestSuite = (setup: () => Kit) => {
  test('returns one partial match of BOLD text, when it is contained', () => {
    const {peritext, editor} = setup();
    editor.cursor.setAt(8, 2);
    editor.saved.insOne('bold');
    editor.cursor.setAt(6, 10);
    peritext.refresh();
    const stats = peritext.overlay.stat(editor.cursor);
    expect(stats).toEqual([new Set(), new Set(['bold']), 0]);
  });

  test('returns one partial match of BOLD text, when it is contained (range)', () => {
    const {peritext, editor} = setup();
    editor.cursor.setAt(8, 2);
    editor.saved.insOne('bold');
    peritext.refresh();
    const range = peritext.rangeAt(6, 10);
    const stats = peritext.overlay.stat(range);
    expect(stats).toEqual([new Set(), new Set(['bold']), 0]);
  });

  test('returns one partial match of BOLD text, when it is overlapping from one side', () => {
    const {peritext, editor} = setup();
    editor.cursor.setAt(8, 5);
    editor.saved.insOne('bold');
    editor.cursor.setAt(6, 5);
    peritext.refresh();
    const stats = peritext.overlay.stat(editor.cursor);
    expect(stats).toEqual([new Set(), new Set(['bold']), 0]);
  });

  test('single slice using range, overlapping', () => {
    const {peritext, editor} = setup();
    editor.cursor.setAt(8, 5);
    editor.saved.insOne('bold');
    peritext.refresh();
    const range = peritext.rangeAt(6, 5);
    const stats = peritext.overlay.stat(range);
    expect(stats).toEqual([new Set(), new Set(['bold']), 0]);
    const range2 = peritext.rangeAt(10, 5);
    const stats2 = peritext.overlay.stat(range2);
    expect(stats2).toEqual([new Set(), new Set(['bold']), 0]);
  });

  test('single slice using range, completely contained', () => {
    const {peritext, editor} = setup();
    editor.cursor.setAt(8, 5);
    editor.saved.insOne('bold');
    peritext.refresh();
    const range = peritext.rangeAt(9, 1);
    const stats = peritext.overlay.stat(range);
    expect(stats).toEqual([new Set(['bold']), new Set(), 0]);
  });

  test('single slice using range, exactly overlapping', () => {
    const {peritext, editor} = setup();
    editor.cursor.setAt(8, 5);
    editor.saved.insOne('bold');
    peritext.refresh();
    const range = peritext.rangeAt(8, 5);
    const stats = peritext.overlay.stat(range);
    expect(stats).toEqual([new Set(['bold']), new Set(), 0]);
  });

  test('returns one partial match of BOLD text, when it is overlapping from one side (reverse)', () => {
    const {peritext, editor} = setup();
    editor.cursor.setAt(8, 5);
    editor.saved.insOne('bold');
    editor.cursor.setAt(10, -5);
    peritext.refresh();
    const stats = peritext.overlay.stat(editor.cursor);
    expect(stats).toEqual([new Set(), new Set(['bold']), 0]);
  });

  test('when inside BOLD text', () => {
    const {peritext, editor} = setup();
    editor.cursor.setAt(8, 5);
    editor.saved.insOne('bold');
    editor.cursor.setAt(12, -2);
    peritext.refresh();
    const stats = peritext.overlay.stat(editor.cursor);
    expect(stats).toEqual([new Set(['bold']), new Set(), 0]);
  });

  describe('when marker is in between a BOLD slice', () => {
    test('range inside the second part of the BOLD slice', () => {
      const {peritext, editor} = setup();
      editor.cursor.setAt(2, 10);
      editor.saved.insOne('bold');
      editor.cursor.setAt(5);
      editor.saved.insMarker('paragraph');
      editor.cursor.setAt(7, 1);
      peritext.refresh();
      const stats = peritext.overlay.stat(editor.cursor);
      expect(stats).toEqual([new Set(['bold']), new Set(), 0]);
    });

    test('range overlaps the second part of the BOLD slice', () => {
      const {peritext, editor} = setup();
      editor.cursor.setAt(2, 10);
      editor.saved.insOne('bold');
      editor.cursor.setAt(5);
      editor.saved.insMarker('paragraph');
      editor.cursor.setAt(7, 10);
      peritext.refresh();
      const stats = peritext.overlay.stat(editor.cursor);
      expect(stats).toEqual([new Set(), new Set(['bold']), 0]);
    });

    test('range inside the first part of the BOLD slice', () => {
      const {peritext, editor} = setup();
      editor.cursor.setAt(2, 10);
      editor.saved.insOne('bold');
      editor.cursor.setAt(5);
      editor.saved.insMarker('paragraph');
      editor.cursor.setAt(3, 1);
      peritext.refresh();
      const stats = peritext.overlay.stat(editor.cursor);
      expect(stats).toEqual([new Set(['bold']), new Set(), 0]);
    });

    test('range overlaps the first part of the BOLD slice', () => {
      const {peritext, editor} = setup();
      editor.cursor.setAt(2, 10);
      editor.saved.insOne('bold');
      editor.cursor.setAt(5);
      editor.saved.insMarker('paragraph');
      editor.cursor.setAt(1, 4);
      peritext.refresh();
      const stats = peritext.overlay.stat(editor.cursor);
      expect(stats).toEqual([new Set(), new Set(['bold']), 0]);
    });
  });

  test('can terminate scan at the marker boundary', () => {
    const {peritext, editor} = setup();
    editor.cursor.setAt(2, 5);
    editor.saved.insOne('bold');
    editor.cursor.setAt(5);
    editor.saved.insMarker('paragraph');
    editor.cursor.setAt(7, 4);
    editor.saved.insOne('italic');
    const range = peritext.rangeAt(3, 7);
    peritext.refresh();
    const stats = peritext.overlay.stat(range, 0);
    expect(stats).toEqual([new Set(['bold']), new Set(), 1]);
  });

  test('multiple interleaved slices', () => {
    const {peritext, editor} = setup();
    editor.cursor.setAt(5, 10);
    editor.saved.insOne('bold');
    editor.cursor.setAt(7, 1);
    editor.saved.insOne('bold');
    editor.cursor.setAt(10, 10);
    editor.saved.insOne('italic');
    peritext.refresh();
    expect(peritext.overlay.stat(peritext.rangeAt(3, 5), 0)).toEqual([new Set(), new Set(['bold']), 0]);
  });

  test('single slice in the middle of text', () => {
    const {peritext, editor} = setup();
    editor.cursor.setAt(10, 10);
    editor.saved.insOne('italic');
    peritext.refresh();
    const assert = (at: number, len: number, complete: unknown[], partial: unknown[]) => {
      const expected = [new Set(complete), new Set(partial), 0];
      const range = peritext.rangeAt(at, len);
      expect(peritext.overlay.stat(range)).toEqual(expected);
      editor.cursor.setAt(at, len);
      expect(peritext.overlay.stat(editor.cursor)).toEqual(expected);
      editor.delCursors();
    };
    assert(0, 2, [], []);
    assert(0, 5, [], []);
    assert(3, 1, [], []);
    assert(3, 10, [], ['italic']);
    assert(10, 1, ['italic'], []);
    assert(10, 5, ['italic'], []);
    assert(11, 2, ['italic'], []);
    assert(15, 2, ['italic'], []);
    assert(15, 6, [], ['italic']);
    assert(20, 1, [], []);
    assert(21, 1, [], []);
  });

  test('single slice in the middle of text (with leading marker)', () => {
    const {peritext, editor} = setup();
    editor.cursor.setAt(5);
    editor.saved.insMarker('blockquote');
    editor.cursor.setAt(10, 10);
    editor.saved.insOne('italic');
    peritext.refresh();
    const assert = (at: number, len: number, complete: unknown[], partial: unknown[]) => {
      const expected = [new Set(complete), new Set(partial), expect.any(Number)];
      const range = peritext.rangeAt(at, len);
      expect(peritext.overlay.stat(range)).toEqual(expected);
      editor.cursor.setAt(at, len);
      expect(peritext.overlay.stat(editor.cursor)).toEqual(expected);
      editor.delCursors();
    };
    assert(0, 2, [], []);
    assert(0, 5, [], []);
    assert(3, 1, [], []);
    assert(3, 10, [], ['italic']);
    assert(10, 1, ['italic'], []);
    assert(10, 5, ['italic'], []);
    assert(11, 2, ['italic'], []);
    assert(15, 2, ['italic'], []);
    assert(15, 6, [], ['italic']);
    assert(20, 1, [], []);
    assert(21, 1, [], []);
  });

  test('single slice at the beginning of text', () => {
    const {peritext, editor} = setup();
    editor.cursor.setAt(0, 10);
    editor.saved.insOne('italic');
    peritext.refresh();
    const assert = (at: number, len: number, complete: unknown[], partial: unknown[]) => {
      const expected = [new Set(complete), new Set(partial), 0];
      const range = peritext.rangeAt(at, len);
      expect(peritext.overlay.stat(range)).toEqual(expected);
      editor.cursor.setAt(at, len);
      expect(peritext.overlay.stat(editor.cursor)).toEqual(expected);
      editor.delCursors();
    };
    assert(0, 2, ['italic'], []);
    assert(0, 5, ['italic'], []);
    assert(3, 1, ['italic'], []);
    assert(8, 3, [], ['italic']);
    assert(3, 10, [], ['italic']);
    assert(10, 1, [], []);
    assert(10, 5, [], []);
    assert(11, 3, [], []);
  });

  test('single slice at the end of text', () => {
    const {peritext, editor} = setup();
    editor.cursor.setAt(20, 20);
    editor.saved.insOne('italic');
    peritext.refresh();
    const assert = (at: number, len: number, complete: unknown[], partial: unknown[]) => {
      const expected = [new Set(complete), new Set(partial), 0];
      const range = peritext.rangeAt(at, len);
      expect(peritext.overlay.stat(range)).toEqual(expected);
      editor.cursor.setAt(at, len);
      expect(peritext.overlay.stat(editor.cursor)).toEqual(expected);
      editor.delCursors();
    };
    assert(0, 2, [], []);
    assert(0, 5, [], []);
    assert(3, 1, [], []);
    assert(13, 10, [], ['italic']);
    assert(20, 1, ['italic'], []);
    assert(20, 5, ['italic'], []);
    assert(21, 2, ['italic'], []);
    assert(25, 2, ['italic'], []);
    assert(25, 22, ['italic'], []);
  });

  test('handles erasure in the middle', () => {
    const {peritext, editor} = setup();
    editor.cursor.setAt(5, 15);
    editor.saved.insOne('bold');
    editor.cursor.setAt(10, 5);
    editor.saved.insErase('bold');
    peritext.refresh();
    const assert = (at: number, len: number, complete: unknown[], partial: unknown[]) => {
      const expected = [new Set(complete), new Set(partial), 0];
      const range = peritext.rangeAt(at, len);
      expect(peritext.overlay.stat(range)).toEqual(expected);
      editor.cursor.setAt(at, len);
      expect(peritext.overlay.stat(editor.cursor)).toEqual(expected);
      peritext.refresh();
      expect(peritext.overlay.stat(editor.cursor)).toEqual(expected);
      editor.delCursors();
    };
    assert(0, 2, [], []);
    assert(0, 5, [], []);
    assert(3, 1, [], []);
    assert(3, 5, [], ['bold']);
    assert(6, 2, ['bold'], []);
    assert(6, 5, [], ['bold']);
    assert(8, 10, [], ['bold']);
    assert(8, 15, [], ['bold']);
    assert(11, 2, [], []);
    assert(11, 5, [], ['bold']);
    assert(11, 10, [], ['bold']);
    assert(16, 2, ['bold'], []);
    assert(12, 7, [], ['bold']);
    assert(21, 2, [], []);
  });

  test('caret with overlapping slices and erasure', () => {
    const {peritext, editor} = setup();
    editor.cursor.setAt(5, 10);
    editor.saved.insOne('bold');
    editor.cursor.setAt(10, 10);
    editor.saved.insOne('italic');
    editor.cursor.setAt(7, 2);
    editor.saved.insErase('bold');
    peritext.refresh();
    const assert = (at: number, complete: unknown[], partial: unknown[]) => {
      const expected = [new Set(complete), new Set(partial), 0];
      const range = peritext.rangeAt(at);
      expect(peritext.overlay.stat(range)).toEqual(expected);
      editor.cursor.setAt(at);
      expect(peritext.overlay.stat(editor.cursor)).toEqual(expected);
      peritext.refresh();
      expect(peritext.overlay.stat(editor.cursor)).toEqual(expected);
      editor.delCursors();
    };
    assert(0, [], []);
    assert(2, [], []);
    assert(6, ['bold'], []);
    assert(8, [], []);
    assert(9, ['bold'], []);
    assert(10, ['bold'], []);
    assert(11, ['bold', 'italic'], []);
    assert(13, ['bold', 'italic'], []);
    assert(16, ['italic'], []);
    assert(20, [], []);
    assert(21, [], []);
  });
};

describe('.stat()', () => {
  runAlphabetKitTestSuite(statTestSuite);
});
