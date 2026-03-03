import {type Kit, setupHelloWorldKit, setupHelloWorldWithFewEditsKit} from '../../__tests__/setup';
import {Cursor} from '../../editor/Cursor';
import {Anchor} from '../../rga/constants';
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
      editor.cursor.setAt(3, 6);
      editor.saved.insStack('bold');
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

    test('exclusive range', () => {
      const {peritext, editor} = setup();
      const range1 = peritext.range(peritext.pointAt(1, Anchor.After), peritext.pointAt(4, Anchor.Before));
      const range2 = peritext.range(peritext.pointAt(2, Anchor.Before), peritext.pointAt(3, Anchor.After));
      editor.cursor.setRange(range1);
      editor.saved.insStack('a1');
      editor.cursor.setRange(range2);
      editor.saved.insStack('a2');
      editor.delCursors();
      peritext.overlay.refresh();
      const slices1 = peritext.overlay.findContained(range1);
      const slices2 = peritext.overlay.findContained(range1, true); // exclusive
      expect(slices1.size).toBe(2);
      expect(slices2.size).toBe(1);
      expect([...slices1][0].type()).toBe('a1');
      expect([...slices1][1].type()).toBe('a2');
      expect([...slices2][0].type()).toBe('a2');
    });
  });

  describe('.findFirstContained()', () => {
    test('returns empty by default', () => {
      const {peritext} = setup();
      peritext.overlay.refresh();
      const slice = peritext.overlay.findFirstContained(peritext.rangeAt(3, 4));
      expect(slice).toBe(undefined);
    });

    test('returns a single contained slice', () => {
      const {peritext, editor} = setup();
      editor.cursor.setAt(3, 6);
      editor.saved.insStack('bold');
      editor.cursor.setAt(3, 2);
      editor.saved.insStack('em');
      editor.cursor.setAt(0);
      peritext.overlay.refresh();
      const slice = peritext.overlay.findFirstContained(peritext.rangeAt(3, 4));
      expect(slice?.type()).toBe('em');
    });

    test('returns the first slice', () => {
      const {peritext, editor} = setup();
      editor.cursor.setAt(3, 1);
      editor.saved.insStack('em');
      editor.cursor.setAt(5, 2);
      editor.saved.insStack('bold');
      editor.cursor.setAt(0);
      peritext.overlay.refresh();
      const slice = peritext.overlay.findFirstContained(peritext.rangeAt(2, 8));
      expect(slice?.type()).toBe('em');
    });

    test('does not return overlapping slice', () => {
      const {peritext, editor} = setup();
      editor.cursor.setAt(3, 4);
      editor.saved.insStack('em');
      editor.cursor.setAt(5, 2);
      editor.saved.insStack('bold');
      editor.cursor.setAt(0);
      peritext.overlay.refresh();
      const slice = peritext.overlay.findFirstContained(peritext.rangeAt(4, 8));
      expect(slice?.type()).toBe('bold');
    });

    test('returns split blocks', () => {
      const {peritext, editor} = setup();
      editor.cursor.setAt(8);
      editor.saved.insMarker('p');
      editor.cursor.setAt(0);
      peritext.overlay.refresh();
      const slice = peritext.overlay.findFirstContained(peritext.rangeAt(4, 8));
      expect(slice?.type()).toBe('p');
    });

    test('returns split blocks, can opt out of block splits', () => {
      const {peritext, editor} = setup();
      editor.cursor.setAt(8);
      editor.saved.insMarker('p');
      editor.cursor.setAt(0);
      peritext.overlay.refresh();
      const slice = peritext.overlay.findFirstContained(peritext.rangeAt(4, 8), false, true);
      expect(slice).toBe(undefined);
    });

    test('exclusive range', () => {
      const {peritext, editor} = setup();
      const range1 = peritext.range(peritext.pointAt(1, Anchor.After), peritext.pointAt(4, Anchor.Before));
      const range2 = peritext.range(peritext.pointAt(2, Anchor.Before), peritext.pointAt(3, Anchor.After));
      editor.cursor.setRange(range1);
      editor.saved.insStack('a1');
      editor.cursor.setRange(range2);
      editor.saved.insStack('a2');
      editor.delCursors();
      peritext.overlay.refresh();
      const slice1 = peritext.overlay.findFirstContained(range1);
      const slice2 = peritext.overlay.findFirstContained(range1, true); // exclusive
      expect(slice1?.type()).toBe('a1');
      expect(slice2?.type()).toBe('a2');
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
