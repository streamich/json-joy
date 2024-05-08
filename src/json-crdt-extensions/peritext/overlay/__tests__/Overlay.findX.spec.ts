import {Kit, setupHelloWorldKit, setupHelloWorldWithFewEditsKit} from '../../__tests__/setup';

const runFindContainedTests = (setup: () => Kit) => {
  describe('.findContained()', () => {
    test('returns empty set by default', () => {
      const {peritext} = setup();
      peritext.overlay.refresh();
      const slices = peritext.overlay.findContained(peritext.rangeAt(3, 4));
      expect(slices.size).toBe(0);
    });

    test('returns a single contained slice', () => {
      const {peritext, editor} = setup();
      editor.cursor.setAt(3, 2);
      editor.saved.insStack('em');
      editor.cursor.setAt(0);
      peritext.overlay.refresh();
      const slices = peritext.overlay.findContained(peritext.rangeAt(3, 4));
      expect(slices.size).toBe(1);
    });

    test('returns two contained slice', () => {
      const {peritext, editor} = setup();
      editor.cursor.setAt(3, 1);
      editor.saved.insStack('em');
      editor.cursor.setAt(5, 2);
      editor.saved.insStack('bold');
      editor.cursor.setAt(0);
      peritext.overlay.refresh();
      const slices = peritext.overlay.findContained(peritext.rangeAt(2, 8));
      expect(slices.size).toBe(2);
    });

    test('does not return overlapping slice', () => {
      const {peritext, editor} = setup();
      editor.cursor.setAt(3, 4);
      editor.saved.insStack('em');
      editor.cursor.setAt(5, 2);
      editor.saved.insStack('bold');
      editor.cursor.setAt(0);
      peritext.overlay.refresh();
      const slices = peritext.overlay.findContained(peritext.rangeAt(4, 8));
      expect(slices.size).toBe(1);
    });

    test('returns split blocks', () => {
      const {peritext, editor} = setup();
      editor.cursor.setAt(3, 4);
      editor.saved.insStack('em');
      editor.cursor.setAt(5, 2);
      editor.saved.insStack('bold');
      editor.cursor.setAt(8);
      editor.saved.insMarker('p');
      editor.cursor.setAt(0);
      peritext.overlay.refresh();
      const slices = peritext.overlay.findContained(peritext.rangeAt(4, 8));
      expect(slices.size).toBe(2);
    });
  });
};

const runFindOverlappingTests = (setup: () => Kit) => {
  describe('.findOverlapping()', () => {
    test('returns empty set by default', () => {
      const {peritext} = setup();
      peritext.overlay.refresh();
      const slices = peritext.overlay.findOverlapping(peritext.rangeAt(3, 4));
      expect(slices.size).toBe(0);
    });

    test('returns a single contained slice', () => {
      const {peritext, editor} = setup();
      editor.cursor.setAt(3, 2);
      editor.saved.insStack('em');
      editor.cursor.setAt(0);
      peritext.overlay.refresh();
      const slices = peritext.overlay.findOverlapping(peritext.rangeAt(3, 4));
      expect(slices.size).toBe(1);
    });

    test('returns two contained slice', () => {
      const {peritext, editor} = setup();
      editor.cursor.setAt(3, 1);
      editor.saved.insStack('em');
      editor.cursor.setAt(5, 2);
      editor.saved.insStack('bold');
      editor.cursor.setAt(0);
      peritext.overlay.refresh();
      const slices = peritext.overlay.findOverlapping(peritext.rangeAt(2, 8));
      expect(slices.size).toBe(2);
    });

    test('returns overlapping slices', () => {
      const {peritext, editor} = setup();
      editor.cursor.setAt(3, 4);
      editor.saved.insStack('em');
      editor.cursor.setAt(5, 2);
      editor.saved.insStack('bold');
      editor.cursor.setAt(0);
      peritext.overlay.refresh();
      const slices = peritext.overlay.findOverlapping(peritext.rangeAt(4, 8));
      expect(slices.size).toBe(2);
    });

    test('returns overlapping slices from both ends', () => {
      const {peritext, editor} = setup();
      editor.cursor.setAt(3, 2);
      editor.saved.insStack('em');
      editor.cursor.setAt(8, 2);
      editor.saved.insStack('bold');
      editor.cursor.setAt(0);
      peritext.overlay.refresh();
      const slices = peritext.overlay.findOverlapping(peritext.rangeAt(4, 5));
      expect(slices.size).toBe(2);
    });

    test('returns split blocks', () => {
      const {peritext, editor} = setup();
      editor.cursor.setAt(3, 4);
      editor.saved.insStack('em');
      editor.cursor.setAt(5, 2);
      editor.saved.insStack('bold');
      editor.cursor.setAt(8);
      editor.saved.insMarker('p');
      editor.cursor.setAt(0);
      peritext.overlay.refresh();
      const slices = peritext.overlay.findOverlapping(peritext.rangeAt(4, 8));
      expect(slices.size).toBe(3);
    });
  });
};

describe('text "hello world", no edits', () => {
  runFindContainedTests(setupHelloWorldKit);
  runFindOverlappingTests(setupHelloWorldKit);
});

describe('text "hello world", with few edits', () => {
  runFindContainedTests(setupHelloWorldWithFewEditsKit);
  runFindOverlappingTests(setupHelloWorldWithFewEditsKit);
});
