import {Model} from '../../../../json-crdt/model';
import {Peritext} from '../../Peritext';
import {Point} from '../../rga/Point';
import {Editor} from '../Editor';

const setup = (insert = (editor: Editor) => editor.insert('Hello world!'), sid?: number) => {
  const model = Model.withLogicalClock(sid);
  model.api.root({
    text: '',
    slices: [],
  });
  const peritext = new Peritext(model, model.api.str(['text']).node, model.api.arr(['slices']).node);
  const editor = peritext.editor;
  insert(editor);
  return {model, peritext, editor};
};

describe('.fwdSkipWord()', () => {
  test('can go to the end of a word', () => {
    const {editor} = setup((editor) => editor.insert('Hello world!'));
    editor.cursor.setAt(0);
    const point = editor.fwdSkipWord(editor.cursor.end);
    editor.cursor.end.set(point!);
    expect(editor.cursor.text()).toBe('Hello');
  });

  test('can skip whitespace between words', () => {
    const {editor} = setup((editor) => editor.insert('Hello world!'));
    editor.cursor.setAt(5);
    const point = editor.fwdSkipWord(editor.cursor.end);
    editor.cursor.end.set(point!);
    expect(editor.cursor.text()).toBe(' world');
  });

  test('skipping stops before exclamation mark', () => {
    const {editor} = setup((editor) => editor.insert('Hello world!'));
    editor.cursor.setAt(6);
    const point = editor.fwdSkipWord(editor.cursor.end);
    editor.cursor.end.set(point!);
    expect(editor.cursor.text()).toBe('world');
  });

  test('can skip to the end of string', () => {
    const {editor} = setup((editor) => editor.insert('Hello world!'));
    editor.cursor.setAt(11);
    const point = editor.fwdSkipWord(editor.cursor.end);
    expect(point instanceof Point).toBe(true);
    editor.cursor.end.set(point!);
    expect(editor.cursor.text()).toBe('!');
  });

  test('can skip various character classes', () => {
    const {editor} = setup((editor) =>
      editor.insert("const {editor} = setup(editor => editor.insert('Hello world!'));"),
    );
    editor.cursor.setAt(0);
    const move = (): string => {
      const point = editor.fwdSkipWord(editor.cursor.end);
      if (point) editor.cursor.end.set(point);
      return editor.cursor.text();
    };
    expect(move()).toBe('const');
    expect(move()).toBe('const {editor');
    expect(move()).toBe('const {editor} = setup');
    expect(move()).toBe('const {editor} = setup(editor');
    expect(move()).toBe('const {editor} = setup(editor => editor');
    expect(move()).toBe('const {editor} = setup(editor => editor.insert');
    expect(move()).toBe("const {editor} = setup(editor => editor.insert('Hello");
    expect(move()).toBe("const {editor} = setup(editor => editor.insert('Hello world");
    expect(move()).toBe("const {editor} = setup(editor => editor.insert('Hello world!'));");
  });
});

describe('.bwdSkipWord()', () => {
  test('can skip over simple text.', () => {
    const {editor} = setup((editor) => editor.insert('Hello world!\nfoo bar baz'));
    editor.cursor.setAt(editor.txt.str.length());
    const move = (): string => {
      const point = editor.bwdSkipWord(editor.cursor.start);
      if (point) editor.cursor.start.set(point);
      return editor.cursor.text();
    };
    expect(move()).toBe('baz');
    expect(move()).toBe('bar baz');
    expect(move()).toBe('foo bar baz');
    expect(move()).toBe('world!\nfoo bar baz');
    expect(move()).toBe('Hello world!\nfoo bar baz');
  });

  test('can skip various character classes', () => {
    const {editor} = setup((editor) =>
      editor.insert("const {editor} = setup(editor => editor.insert('Hello world!'));"),
    );
    editor.cursor.setAt(editor.txt.str.length());
    const move = (): string => {
      const point = editor.bwdSkipWord(editor.cursor.start);
      if (point) editor.cursor.start.set(point);
      return editor.cursor.text();
    };
    expect(move()).toBe("world!'));");
    expect(move()).toBe("Hello world!'));");
    expect(move()).toBe("insert('Hello world!'));");
    expect(move()).toBe("editor.insert('Hello world!'));");
    expect(move()).toBe("editor => editor.insert('Hello world!'));");
    expect(move()).toBe("setup(editor => editor.insert('Hello world!'));");
    expect(move()).toBe("editor} = setup(editor => editor.insert('Hello world!'));");
    expect(move()).toBe("const {editor} = setup(editor => editor.insert('Hello world!'));");
  });
});
