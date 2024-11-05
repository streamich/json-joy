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

  test('returns one partial match of BOLD text, when it is overlapping from one side', () => {
    const {peritext, editor} = setup();
    editor.cursor.setAt(8, 5);
    editor.saved.insOverwrite('bold');
    editor.cursor.setAt(6, 5);
    peritext.refresh();
    const stats = peritext.overlay.stat(editor.cursor);
    expect(stats).toEqual([new Set(), new Set(['bold']), 0]);
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
};

describe('.stat()', () => {
  runAlphabetKitTestSuite(statTestSuite);
});
