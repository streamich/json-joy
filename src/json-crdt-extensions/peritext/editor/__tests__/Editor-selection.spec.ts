import {Model} from '../../../../json-crdt/model';
import {Peritext} from '../../Peritext';
import {Point} from '../../rga/Point';
import {Anchor} from '../../rga/constants';
import {Editor} from '../Editor';

const setup = (insert = (editor: Editor) => editor.insert('Hello world!'), sid?: number) => {
  const model = Model.create(void 0, sid);
  model.api.root({
    text: '',
    slices: [],
  });
  const peritext = new Peritext(model, model.api.str(['text']).node, model.api.arr(['slices']).node);
  const editor = peritext.editor;
  insert(editor);
  return {model, peritext, editor};
};

describe('.selectAll()', () => {
  test('can select whole document', () => {
    const {editor} = setup();
    editor.selectAll();
    expect(editor.cursor.text()).toBe('Hello world!');
    expect(editor.cursor.start.viewPos()).toBe(0);
    expect(editor.cursor.end.viewPos()).toBe(12);
  });
});

describe('.eow()', () => {
  test('can go to the end of a word', () => {
    const {editor} = setup((editor) => editor.insert('Hello world!'));
    editor.cursor.setAt(0);
    const point = editor.eow(editor.cursor.end);
    editor.cursor.end.set(point!);
    expect(editor.cursor.text()).toBe('Hello');
  });

  test('can skip whitespace between words', () => {
    const {editor} = setup((editor) => editor.insert('Hello world!'));
    editor.cursor.setAt(5);
    const point = editor.eow(editor.cursor.end);
    editor.cursor.end.set(point!);
    expect(editor.cursor.text()).toBe(' world');
  });

  test('skipping stops before exclamation mark', () => {
    const {editor} = setup((editor) => editor.insert('Hello world!'));
    editor.cursor.setAt(6);
    const point = editor.eow(editor.cursor.end);
    editor.cursor.end.set(point!);
    expect(editor.cursor.text()).toBe('world');
  });

  test('can skip to the end of string', () => {
    const {editor} = setup((editor) => editor.insert('Hello world!'));
    editor.cursor.setAt(11);
    const point = editor.eow(editor.cursor.end);
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
      const point = editor.eow(editor.cursor.end);
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

describe('.bow()', () => {
  test('can skip over simple text.', () => {
    const {editor} = setup((editor) => editor.insert('Hello world!\nfoo bar baz'));
    editor.cursor.setAt(editor.txt.str.length());
    const move = (): string => {
      const point = editor.bow(editor.cursor.start);
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
      const point = editor.bow(editor.cursor.start);
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

describe('.eol()', () => {
  test('can skip until end of line', () => {
    const {editor} = setup((editor) => editor.insert('Hello world!\nfoo bar baz'));
    editor.cursor.setAt(0);
    const gotoEol = (): string => {
      const point = editor.eol(editor.cursor.end);
      if (point) editor.cursor.end.set(point);
      return editor.cursor.text();
    };
    expect(gotoEol()).toBe('Hello world!');
  });

  test('does not move once already at the end of line', () => {
    const {editor} = setup((editor) => editor.insert('Hello world!\nfoo bar baz'));
    editor.cursor.setAt(0);
    const gotoEol = (): string => {
      const point = editor.eol(editor.cursor.start);
      if (point) editor.cursor.end.set(point);
      return editor.cursor.text();
    };
    expect(gotoEol()).toBe('Hello world!');
    expect(gotoEol()).toBe('Hello world!');
    expect(gotoEol()).toBe('Hello world!');
  });

  test('can go to the end of text', () => {
    const {editor} = setup((editor) => editor.insert('Hello world!\nfoo bar baz'));
    editor.cursor.setAt(0);
    const gotoEol = (): string => {
      const point = editor.eol(editor.cursor.end);
      if (point) editor.cursor.end.set(point);
      return editor.cursor.text();
    };
    expect(gotoEol()).toBe('Hello world!');
    expect(gotoEol()).toBe('Hello world!');
    editor.cursor.end.step(1);
    expect(editor.cursor.text()).toBe('Hello world!\n');
    expect(gotoEol()).toBe('Hello world!\nfoo bar baz');
    expect(gotoEol()).toBe('Hello world!\nfoo bar baz');
    expect(gotoEol()).toBe('Hello world!\nfoo bar baz');
  });
});

describe('.bol()', () => {
  test('can skip until beginning of line', () => {
    const {editor} = setup((editor) => editor.insert('Hello world!\nfoo bar baz'));
    editor.cursor.setAt(editor.txt.str.length());
    const gotoBol = (): string => {
      const point = editor.bol(editor.cursor.start);
      if (point) editor.cursor.start.set(point);
      return editor.cursor.text();
    };
    expect(gotoBol()).toBe('foo bar baz');
  });

  test('does not move once already at the beginning of line', () => {
    const {editor} = setup((editor) => editor.insert('Hello world!\nfoo bar baz'));
    editor.cursor.setAt(editor.txt.str.length());
    const gotoBol = (): string => {
      const point = editor.bol(editor.cursor.start);
      if (point) editor.cursor.start.set(point);
      return editor.cursor.text();
    };
    expect(gotoBol()).toBe('foo bar baz');
    expect(gotoBol()).toBe('foo bar baz');
    expect(gotoBol()).toBe('foo bar baz');
  });

  test('can go to the beginning of text', () => {
    const {editor} = setup((editor) => editor.insert('Hello world!\nfoo bar baz'));
    editor.cursor.setAt(editor.txt.str.length());
    const gotoBol = (): string => {
      const point = editor.bol(editor.cursor.start);
      if (point) editor.cursor.start.set(point);
      return editor.cursor.text();
    };
    expect(gotoBol()).toBe('foo bar baz');
    expect(gotoBol()).toBe('foo bar baz');
    expect(gotoBol()).toBe('foo bar baz');
    editor.cursor.start.step(-1);
    expect(editor.cursor.text()).toBe('\nfoo bar baz');
    expect(gotoBol()).toBe('Hello world!\nfoo bar baz');
    expect(gotoBol()).toBe('Hello world!\nfoo bar baz');
  });
});

describe('.bob()', () => {
  test('first paragraph returns beginning of text', () => {
    const {editor, peritext} = setup((editor) => {
      editor.insert('abcdef');
      editor.cursor.setAt(3);
      editor.saved.insMarker('p');
    });
    peritext.overlay.refresh();
    expect(editor.bob(peritext.pointAt(0, Anchor.Before))!.viewPos()).toBe(0);
    expect(editor.bob(peritext.pointAt(0, Anchor.After))!.viewPos()).toBe(0);
    expect(editor.bob(peritext.pointAt(1, Anchor.Before))!.viewPos()).toBe(0);
    expect(editor.bob(peritext.pointAt(1, Anchor.After))!.viewPos()).toBe(0);
    expect(editor.bob(peritext.pointAt(2, Anchor.Before))!.viewPos()).toBe(0);
    expect(editor.bob(peritext.pointAt(2, Anchor.After))!.viewPos()).toBe(0);
  });

  test('second paragraph returns start of split start point', () => {
    const {editor, peritext} = setup((editor) => {
      editor.insert('abcdef');
      editor.cursor.setAt(3);
      editor.saved.insMarker('p');
    });
    peritext.overlay.refresh();
    expect(editor.bob(peritext.pointAt(3, Anchor.Before))!.viewPos()).toBe(3);
    expect(editor.bob(peritext.pointAt(3, Anchor.After))!.viewPos()).toBe(3);
    expect(editor.bob(peritext.pointAt(4, Anchor.Before))!.viewPos()).toBe(3);
    expect(editor.bob(peritext.pointAt(4, Anchor.After))!.viewPos()).toBe(3);
    expect(editor.bob(peritext.pointAt(5, Anchor.Before))!.viewPos()).toBe(3);
    expect(editor.bob(peritext.pointAt(5, Anchor.After))!.viewPos()).toBe(3);
    expect(editor.bob(peritext.pointAt(6, Anchor.Before))!.viewPos()).toBe(3);
    expect(editor.bob(peritext.pointAt(6, Anchor.After))!.viewPos()).toBe(3);
  });
});

describe('.eob()', () => {
  test('finds end of first paragraph', () => {
    const {editor, peritext} = setup((editor) => {
      editor.insert('abcdef');
      editor.cursor.setAt(3);
      editor.saved.insMarker('p');
    });
    peritext.overlay.refresh();
    expect(editor.eob(peritext.pointAt(0, Anchor.Before))!.viewPos()).toBe(3);
    expect(editor.eob(peritext.pointAt(0, Anchor.After))!.viewPos()).toBe(3);
    expect(editor.eob(peritext.pointAt(1, Anchor.Before))!.viewPos()).toBe(3);
    expect(editor.eob(peritext.pointAt(1, Anchor.After))!.viewPos()).toBe(3);
    expect(editor.eob(peritext.pointAt(2, Anchor.Before))!.viewPos()).toBe(3);
    expect(editor.eob(peritext.pointAt(2, Anchor.After))!.viewPos()).toBe(3);
    expect(editor.eob(peritext.pointAt(0, Anchor.Before))!.anchor).toBe(Anchor.After);
    expect(editor.eob(peritext.pointAt(0, Anchor.After))!.anchor).toBe(Anchor.After);
    expect(editor.eob(peritext.pointAt(1, Anchor.Before))!.anchor).toBe(Anchor.After);
    expect(editor.eob(peritext.pointAt(1, Anchor.After))!.anchor).toBe(Anchor.After);
    expect(editor.eob(peritext.pointAt(2, Anchor.Before))!.anchor).toBe(Anchor.After);
    expect(editor.eob(peritext.pointAt(2, Anchor.After))!.anchor).toBe(Anchor.After);
  });

  test('finds end of last paragraph', () => {
    const {editor, peritext} = setup((editor) => {
      editor.insert('abcdef');
      editor.cursor.setAt(3);
      editor.saved.insMarker('p');
    });
    peritext.overlay.refresh();
    expect(editor.eob(peritext.pointAt(3, Anchor.Before))!.viewPos()).toBe(7);
    expect(editor.eob(peritext.pointAt(3, Anchor.After))!.viewPos()).toBe(7);
    expect(editor.eob(peritext.pointAt(4, Anchor.Before))!.viewPos()).toBe(7);
    expect(editor.eob(peritext.pointAt(4, Anchor.After))!.viewPos()).toBe(7);
    expect(editor.eob(peritext.pointAt(5, Anchor.Before))!.viewPos()).toBe(7);
    expect(editor.eob(peritext.pointAt(5, Anchor.After))!.viewPos()).toBe(7);
    expect(editor.eob(peritext.pointAt(6, Anchor.Before))!.viewPos()).toBe(7);
    expect(editor.eob(peritext.pointAt(6, Anchor.After))!.viewPos()).toBe(7);
  });
});
