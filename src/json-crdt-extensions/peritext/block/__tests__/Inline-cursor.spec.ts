import {type Kit, setupKit, setupNumbersKit, setupNumbersWithTombstonesKit} from '../../__tests__/setup';
import {Cursor} from '../../editor/Cursor';
import {CursorAnchor} from '../../slice/constants';
import {Inline} from '../Inline';

const runTests = (setup: () => Kit) => {
  test('caret at ABS start appears correctly in attributes', () => {
    const {peritext, editor} = setup();
    const point = peritext.pointAbsStart();
    editor.cursor.set(point);
    peritext.refresh();
    const inline = [...peritext.blocks.root.children[0]!.texts()][0];
    expect(inline).toBeInstanceOf(Inline);
    const selection = inline.selection();
    expect(selection).toBe(undefined);
    const cursor = inline.cursorStart();
    expect(cursor).toBeInstanceOf(Cursor);
  });

  test('selection with anchor at ABS start', () => {
    const {peritext, editor} = setup();
    const point1 = peritext.pointAbsStart();
    const point2 = peritext.pointAt(4);
    editor.cursor.set(point1, point2, CursorAnchor.Start);
    peritext.refresh();
    const inlines = [...peritext.blocks.root.children[0]!.texts()];
    const inline1 = inlines[0];
    const inline2 = inlines[1];
    expect(inline1).toBeInstanceOf(Inline);
    const selection = inline1.selection();
    expect(selection).toEqual(['anchor', 'focus']);
    expect(inline2.attr()).toEqual({});
  });

  test('selection with focus at ABS start', () => {
    const {peritext, editor} = setup();
    const point1 = peritext.pointAbsStart();
    const point2 = peritext.pointAt(4);
    editor.cursor.set(point1, point2, CursorAnchor.End);
    peritext.refresh();
    const inlines = [...peritext.blocks.root.children[0]!.texts()];
    const inline1 = inlines[0];
    const inline2 = inlines[1];
    expect(inline1).toBeInstanceOf(Inline);
    const selection = inline1.selection();
    expect(selection).toEqual(['focus', 'anchor']);
    expect(inline2.attr()).toEqual({});
  });

  test('selection with focus at ABS end', () => {
    const {peritext, editor} = setup();
    const point1 = peritext.pointAt(4);
    const point2 = peritext.pointAbsEnd();
    editor.cursor.set(point1, point2, CursorAnchor.Start);
    peritext.refresh();
    const inlines = [...peritext.blocks.root.children[0]!.texts()];
    const inline1 = inlines[0];
    const inline2 = inlines[1];
    expect(inline2).toBeInstanceOf(Inline);
    const selection = inline2.selection();
    expect(selection).toEqual(['anchor', 'focus']);
    expect(inline1.attr()).toEqual({});
  });

  test('selection with anchor at ABS end', () => {
    const {peritext, editor} = setup();
    const point1 = peritext.pointAt(4);
    const point2 = peritext.pointAbsEnd();
    editor.cursor.set(point1, point2, CursorAnchor.End);
    peritext.refresh();
    const inlines = [...peritext.blocks.root.children[0]!.texts()];
    const inline1 = inlines[0];
    const inline2 = inlines[1];
    expect(inline2).toBeInstanceOf(Inline);
    const selection = inline2.selection();
    expect(selection).toEqual(['focus', 'anchor']);
    expect(inline1.attr()).toEqual({});
  });

  test('caret at ABS end appears correctly in attributes', () => {
    const {peritext, editor} = setup();
    const point = peritext.pointAbsEnd();
    editor.cursor.set(point);
    peritext.refresh();
    const inlines = [...peritext.blocks.root.children[0]!.texts()];
    const inline = inlines[inlines.length - 1];
    expect(inline).toBeInstanceOf(Inline);
    const selection = inline.selection();
    expect(selection).toBe(undefined);
    const cursor = inline.cursorEnd();
    expect(cursor).toBeInstanceOf(Cursor);
  });
};

describe('Inline (cursor)', () => {
  describe('lorem ipsum', () => {
    runTests(() => setupKit('lorem ipsum dolor sit amet'));
  });

  describe('numbers "0123456789", no edits', () => {
    runTests(setupNumbersKit);
  });

  describe('numbers "0123456789", with default schema and tombstones', () => {
    runTests(setupNumbersWithTombstonesKit);
  });

  describe('numbers "0123456789", with default schema and tombstones and constant sid', () => {
    runTests(() => setupNumbersWithTombstonesKit(12313123));
  });
});
