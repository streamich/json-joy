import {Model} from '../../../../json-crdt/model';
import {Peritext} from '../../Peritext';
import {Anchor} from '../../constants';
import {Editor} from '../../editor/Editor';

const setup = (insert: (editor: Editor) => void = (editor) => editor.insert('Hello world!')) => {
  const model = Model.withLogicalClock();
  model.api.root({
    text: '',
    slices: [],
  });
  const peritext = new Peritext(model, model.api.str(['text']).node, model.api.arr(['slices']).node);
  const editor = peritext.editor;
  insert(editor);
  return {model, peritext, editor};
};

describe('.contains()', () => {
  test('returns true if slice is contained', () => {
    const {peritext, editor} = setup();
    editor.setCursor(3, 2);
    const slice = editor.insertOverwriteSlice('b');
    editor.setCursor(0);
    peritext.refresh();
    expect(peritext.rangeAt(2, 4).contains(slice)).toBe(true);
    expect(peritext.rangeAt(3, 4).contains(slice)).toBe(true);
    expect(peritext.rangeAt(2, 3).contains(slice)).toBe(true);
    expect(peritext.rangeAt(3, 2).contains(slice)).toBe(true);
  });

  test('returns false if slice is not contained', () => {
    const {peritext, editor} = setup();
    editor.setCursor(3, 2);
    const slice = editor.insertOverwriteSlice('b');
    editor.setCursor(0);
    peritext.refresh();
    expect(peritext.rangeAt(3, 1).contains(slice)).toBe(false);
    expect(peritext.rangeAt(2, 1).contains(slice)).toBe(false);
    expect(peritext.rangeAt(2, 2).contains(slice)).toBe(false);
    expect(peritext.rangeAt(1, 1).contains(slice)).toBe(false);
    expect(peritext.rangeAt(4, 5).contains(slice)).toBe(false);
    expect(peritext.rangeAt(8, 1).contains(slice)).toBe(false);
  });
});

describe('.isCollapsed()', () => {
  test('returns true when endpoints point to the same location', () => {
    const {editor} = setup();
    editor.setCursor(3);
    expect(editor.cursor.isCollapsed()).toBe(true);
  });

  test('returns true when when there is no visible content between endpoints', () => {
    const {peritext, editor} = setup();
    const range = peritext.rangeAt(2, 1);
    editor.setCursor(2, 1);
    editor.delete();
    expect(range.isCollapsed()).toBe(true);
  });
});

describe('.expand()', () => {
  const runExpandTests = (setup2: typeof setup) => {
    test('can expand anchors to include adjacent elements', () => {
      const {editor} = setup2();
      editor.setCursor(1, 1);
      expect(editor.cursor.start.pos()).toBe(1);
      expect(editor.cursor.start.anchor).toBe(Anchor.Before);
      expect(editor.cursor.end.pos()).toBe(1);
      expect(editor.cursor.end.anchor).toBe(Anchor.After);
      editor.cursor.expand();
      expect(editor.cursor.start.pos()).toBe(0);
      expect(editor.cursor.start.anchor).toBe(Anchor.After);
      expect(editor.cursor.end.pos()).toBe(2);
      expect(editor.cursor.end.anchor).toBe(Anchor.Before);
      // console.log(peritext + '')
    });

    test('can expand anchors to contain include adjacent tombstones', () => {
      const {peritext, editor} = setup2();
      const tombstone1 = peritext.rangeAt(1, 1);
      tombstone1.expand();
      const tombstone2 = peritext.rangeAt(3, 1);
      tombstone2.expand();
      editor.cursor.setRange(tombstone1);
      editor.delete();
      editor.cursor.setRange(tombstone2);
      editor.delete();
      const range = peritext.rangeAt(1, 1);
      range.expand();
      expect(range.start.pos()).toBe(tombstone1.start.pos());
      expect(range.start.anchor).toBe(tombstone1.start.anchor);
      expect(range.end.pos()).toBe(tombstone2.end.pos());
      expect(range.end.anchor).toBe(tombstone2.end.anchor);
    });
  };

  describe('single text chunk', () => {
    runExpandTests(setup);
  });

  describe('each car is own chunk', () => {
    runExpandTests(() =>
      setup((editor) => {
        editor.insert('!');
        editor.setCursor(0);
        editor.insert('d');
        editor.setCursor(0);
        editor.insert('l');
        editor.setCursor(0);
        editor.insert('r');
        editor.setCursor(0);
        editor.insert('o');
        editor.setCursor(0);
        editor.insert('w');
        editor.setCursor(0);
        editor.insert(' ');
        editor.setCursor(0);
        editor.insert('o');
        editor.setCursor(0);
        editor.insert('l');
        editor.setCursor(0);
        editor.insert('l');
        editor.setCursor(0);
        editor.insert('e');
        editor.setCursor(0);
        editor.insert('H');
      }),
    );
  });
});
