import {type Kit, setupHelloWorldKit, setupHelloWorldWithFewEditsKit} from '../../__tests__/setup';
import {Cursor} from '../../editor/Cursor';
import {OverlayRefSliceEnd} from '../refs';

const runFind = (setup: () => Kit) => {
  describe('.find()', () => {
    test('can find nothing', () => {
      const {peritext} = setup();
      peritext.overlay.refresh();
      const point = peritext.overlay.find(() => false);
      expect(point).toBe(undefined);
    });

    test('can find a single caret cursor', () => {
      const {peritext} = setup();
      peritext.editor.cursor.setAt(3);
      peritext.overlay.refresh();
      const point = peritext.overlay.find((point) => {
        return point.markers[0] instanceof Cursor;
      })!;
      expect(point.markers[0]).toBe(peritext.editor.cursor);
    });

    test('can find the cursor by selection start', () => {
      const {peritext} = setup();
      peritext.editor.cursor.setAt(3, 3);
      peritext.overlay.refresh();
      const point = peritext.overlay.find((point) => {
        return point.layers[0] === peritext.editor.cursor;
      })!;
      expect(point.layers[0]).toBe(peritext.editor.cursor);
    });

    test('can find the cursor by selection end', () => {
      const {peritext} = setup();
      peritext.editor.cursor.setAt(3, 3);
      peritext.overlay.refresh();
      const point = peritext.overlay.find((point) => {
        if (point.refs[0] instanceof OverlayRefSliceEnd) {
          return point.refs[0].slice === peritext.editor.cursor;
        }
        return false;
      })!;
      expect((point.refs[0] as OverlayRefSliceEnd).slice).toBe(peritext.editor.cursor);
    });
  });
};

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

    test('returns a single contained character', () => {
      const {peritext, editor} = setup();
      editor.cursor.setAt(1, 1);
      const [slice] = editor.saved.insStack('<b>');
      const range = peritext.rangeAt(1, 1);
      range.expand();
      peritext.editor.delCursors();
      peritext.refresh();
      const slices = peritext.overlay.findContained(range);
      expect(slices.size).toBe(1);
      expect([...slices][0]).toBe(slice);
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

    test('returns a single contained character', () => {
      const {peritext, editor} = setup();
      editor.cursor.setAt(1, 1);
      const [slice] = editor.saved.insStack('<b>');
      const range = peritext.rangeAt(1, 1);
      range.expand();
      peritext.editor.delCursors();
      peritext.refresh();
      const slices = peritext.overlay.findOverlapping(range);
      expect(slices.size).toBe(1);
      expect([...slices][0]).toBe(slice);
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

const runTestSuite = (setup: () => Kit) => {
  runFind(setup);
  runFindContainedTests(setup);
  runFindOverlappingTests(setup);
};

describe('text "hello world", no edits', () => {
  runTestSuite(setupHelloWorldKit);
});

describe('text "hello world", with few edits', () => {
  runTestSuite(setupHelloWorldWithFewEditsKit);
});
