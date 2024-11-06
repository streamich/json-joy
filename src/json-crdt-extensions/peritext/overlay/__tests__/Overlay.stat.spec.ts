import {type Kit, runAlphabetKitTestSuite} from '../../__tests__/setup';

const statTestSuite = (setup: () => Kit) => {
  test('returns one partial match of BOLD text, when it is contained', () => {
    const {peritext, editor} = setup();
    editor.cursor.setAt(8, 2);
    editor.saved.insOverwrite('bold');
    editor.cursor.setAt(6, 10);
    peritext.refresh();
    const stats = peritext.overlay.stat(editor.cursor);
    expect(stats).toEqual([new Set(), new Set(['bold']), 0]);
  });

  test('returns one partial match of BOLD text, when it is contained (range)', () => {
    const {peritext, editor} = setup();
    editor.cursor.setAt(8, 2);
    editor.saved.insOverwrite('bold');
    peritext.refresh();
    const range = peritext.rangeAt(6, 10);
    const stats = peritext.overlay.stat(range);
    expect(stats).toEqual([new Set(), new Set(['bold']), 0]);
  });

  test('returns one partial match of BOLD text, when it is overlapping from one side', () => {
    const {peritext, editor} = setup();
    editor.cursor.setAt(8, 5);
    editor.saved.insOverwrite('bold');
    editor.cursor.setAt(6, 5);
    peritext.refresh();
    const stats = peritext.overlay.stat(editor.cursor);
    expect(stats).toEqual([new Set(), new Set(['bold']), 0]);
  });

  test('single slice using range, overlapping', () => {
    const {peritext, editor} = setup();
    editor.cursor.setAt(8, 5);
    editor.saved.insOverwrite('bold');
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
    editor.saved.insOverwrite('bold');
    peritext.refresh();
    const range = peritext.rangeAt(9, 1);
    const stats = peritext.overlay.stat(range);
    expect(stats).toEqual([new Set(['bold']), new Set(), 0]);
  });

  test('single slice using range, exactly overlapping', () => {
    const {peritext, editor} = setup();
    editor.cursor.setAt(8, 5);
    editor.saved.insOverwrite('bold');
    peritext.refresh();
    const range = peritext.rangeAt(8, 5);
    const stats = peritext.overlay.stat(range);
    expect(stats).toEqual([new Set(['bold']), new Set(), 0]);
  });

  test('returns one partial match of BOLD text, when it is overlapping from one side (reverse)', () => {
    const {peritext, editor} = setup();
    editor.cursor.setAt(8, 5);
    editor.saved.insOverwrite('bold');
    editor.cursor.setAt(10, -5);
    peritext.refresh();
    const stats = peritext.overlay.stat(editor.cursor);
    expect(stats).toEqual([new Set(), new Set(['bold']), 0]);
  });

  test('when inside BOLD text', () => {
    const {peritext, editor} = setup();
    editor.cursor.setAt(8, 5);
    editor.saved.insOverwrite('bold');
    editor.cursor.setAt(12, -2);
    peritext.refresh();
    const stats = peritext.overlay.stat(editor.cursor);
    expect(stats).toEqual([new Set(['bold']), new Set(), 0]);
  });

  describe('when marker is in between a BOLD slice', () => {
    test('range inside the second part of the BOLD slice', () => {
      const {peritext, editor} = setup();
      editor.cursor.setAt(2, 10);
      editor.saved.insOverwrite('bold');
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
      editor.saved.insOverwrite('bold');
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
      editor.saved.insOverwrite('bold');
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
      editor.saved.insOverwrite('bold');
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
    editor.saved.insOverwrite('bold');
    editor.cursor.setAt(5);
    editor.saved.insMarker('paragraph');
    editor.cursor.setAt(7, 4);
    editor.saved.insOverwrite('italic');
    const range = peritext.rangeAt(3, 7);
    peritext.refresh();
    const stats = peritext.overlay.stat(range, 0);
    expect(stats).toEqual([new Set(['bold']), new Set(), 1]);
  });

  test('multiple interleaved slices', () => {
    const {peritext, editor} = setup();
    editor.cursor.setAt(5, 10);
    editor.saved.insOverwrite('bold');
    editor.cursor.setAt(7, 1);
    editor.saved.insOverwrite('bold');
    editor.cursor.setAt(10, 10);
    editor.saved.insOverwrite('italic');
    peritext.refresh();
    expect(peritext.overlay.stat(peritext.rangeAt(3, 5), 0)).toEqual([new Set(), new Set(['bold']), 0]);
  });

  test.todo('multiple interleaved styles');
  test.todo('erasures work');
  test.todo('handle stack slices');
  test.todo('Edge case: text REL end');
  test.todo('Edge case: text ABS end');
  test.todo('Edge case: marker overlay point is the first point');
};

describe('.stat()', () => {
  runAlphabetKitTestSuite(statTestSuite);
});
