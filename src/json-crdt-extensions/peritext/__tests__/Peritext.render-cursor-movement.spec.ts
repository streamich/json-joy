import {Model} from '../../../json-crdt/model';
import {Peritext} from '../Peritext';
import {Editor} from '../editor/Editor';
import {Anchor} from '../rga/constants';
import {render} from './render';

const runInlineSlicesTests = (
  desc: string,
  insertNumbers = (editor: Editor) => editor.insert('abcdefghijklmnopqrstuvwxyz'),
) => {
  const setup = () => {
    const model = Model.withLogicalClock(123);
    model.api.root({
      text: '',
      slices: [],
    });
    const peritext = new Peritext(model, model.api.str(['text']).node, model.api.arr(['slices']).node);
    const editor = peritext.editor;
    insertNumbers(editor);
    const view = () => {
      peritext.refresh();
      return render(peritext.blocks.root, '', false);
    };
    // console.log(peritext.str + '');
    return {model, peritext, editor, view};
  };

  describe(desc, () => {
    test('can move cursor forward - starting from middle', () => {
      const {editor, peritext, view} = setup();
      editor.cursor.setAt(1);
      peritext.refresh();
      expect(view()).toMatchInlineSnapshot(`
"<>
  <0>
    "a" {  }
    "bcdefghijklmnopqrstuvwxyz" { -1 = [ [ [ 0, !u ] ], 4 ] }
"
`);
      editor.cursor.move(1);
      peritext.refresh();
      expect(view()).toMatchInlineSnapshot(`
"<>
  <0>
    "ab" {  }
    "cdefghijklmnopqrstuvwxyz" { -1 = [ [ [ 0, !u ] ], 4 ] }
"
`);
      editor.cursor.move(2);
      peritext.refresh();
      expect(view()).toMatchInlineSnapshot(`
"<>
  <0>
    "abcd" {  }
    "efghijklmnopqrstuvwxyz" { -1 = [ [ [ 0, !u ] ], 4 ] }
"
`);
    });

    test('can move cursor forward - starting the beginning of the string', () => {
      const {editor, peritext, view} = setup();
      editor.cursor.setAt(0);
      peritext.refresh();
      // console.log(view());
      expect(view()).toMatchInlineSnapshot(`
"<>
  <0>
    "abcdefghijklmnopqrstuvwxyz" { -1 = [ [ [ 0, !u ] ], 4 ] }
"
`);
      editor.cursor.move(1);
      peritext.refresh();
      // console.log(view());
      // console.log(peritext + '');
      expect(view()).toMatchInlineSnapshot(`
"<>
  <0>
    "a" {  }
    "bcdefghijklmnopqrstuvwxyz" { -1 = [ [ [ 0, !u ] ], 4 ] }
"
`);
      editor.cursor.move(2);
      peritext.refresh();
      // console.log(view());
      expect(view()).toMatchInlineSnapshot(`
"<>
  <0>
    "abc" {  }
    "defghijklmnopqrstuvwxyz" { -1 = [ [ [ 0, !u ] ], 4 ] }
"
`);
    });

    test('can move cursor backward - starting from middle', () => {
      const {editor, peritext} = setup();
      editor.cursor.setAt(5);
      peritext.refresh();
      expect(editor.cursor.start.anchor).toBe(Anchor.After);
      expect(editor.cursor.start.pos()).toEqual(4);
      editor.cursor.move(-1);
      peritext.refresh();
      expect(editor.cursor.start.pos()).toEqual(3);
      editor.cursor.move(-2);
      peritext.refresh();
      expect(editor.cursor.start.pos()).toEqual(1);
      editor.cursor.move(-1);
      peritext.refresh();
      expect(editor.cursor.start.pos()).toEqual(0);
    });

    test('can move cursor backward - starting from end of string', () => {
      const {editor, peritext} = setup();
      editor.cursor.setAt(26);
      peritext.refresh();
      expect(editor.cursor.start.anchor).toBe(Anchor.After);
      expect(editor.cursor.start.pos()).toEqual(25);
      editor.cursor.move(-1);
      peritext.refresh();
      expect(editor.cursor.start.pos()).toEqual(24);
      editor.cursor.move(-2);
      peritext.refresh();
      expect(editor.cursor.start.pos()).toEqual(22);
    });

    test('can move cursor backward - until the beginning of the string', () => {
      const {editor, peritext} = setup();
      editor.cursor.setAt(5);
      peritext.refresh();
      expect(editor.cursor.start.anchor).toBe(Anchor.After);
      expect(editor.cursor.start.pos()).toEqual(4);
      editor.cursor.move(-2);
      peritext.refresh();
      expect(editor.cursor.start.pos()).toEqual(2);
      editor.cursor.move(-3);
      peritext.refresh();
      expect(editor.cursor.start.pos()).toEqual(-1);
    });

    test('can move cursor backward - more than there is space', () => {
      const {editor, peritext} = setup();
      editor.cursor.setAt(5);
      peritext.refresh();
      expect(editor.cursor.start.anchor).toBe(Anchor.After);
      expect(editor.cursor.start.pos()).toEqual(4);
      editor.cursor.move(-111111);
      peritext.refresh();
      expect(editor.cursor.start.pos()).toEqual(-1);
    });
  });
};

runInlineSlicesTests('single text chunk');

runInlineSlicesTests('two text chunks', (editor: Editor) => {
  editor.insert('lmnopqrstuvwxyz');
  editor.cursor.setAt(0);
  editor.insert('abcdefghijk');
});

runInlineSlicesTests('text with block split', (editor: Editor) => {
  editor.insert('lmnwxyz');
  editor.cursor.setAt(3);
  editor.insert('opqrstuv');
  editor.cursor.setAt(0);
  editor.insert('abcdefghijk');
});

runInlineSlicesTests('text with deletes', (editor: Editor) => {
  editor.insert('lmXXXnwYxyz');
  editor.cursor.setAt(2, 3);
  editor.delBwd();
  editor.cursor.setAt(3);
  editor.insert('opqrstuv');
  editor.cursor.setAt(12, 1);
  editor.delBwd();
  editor.cursor.setAt(0);
  editor.insert('ab1c3defghijk4444');
  editor.cursor.setAt(2, 1);
  editor.delBwd();
  editor.cursor.setAt(3, 1);
  editor.delBwd();
  editor.cursor.setAt(11, 4);
  editor.delBwd();
});

runInlineSlicesTests('written in reverse', (editor: Editor) => {
  editor.insert('z');
  editor.cursor.setAt(0);
  editor.insert('y');
  editor.cursor.setAt(0);
  editor.insert('x');
  editor.cursor.setAt(0);
  editor.insert('w');
  editor.cursor.setAt(0);
  editor.insert('v');
  editor.cursor.setAt(0);
  editor.insert('u');
  editor.cursor.setAt(0);
  editor.insert('t');
  editor.cursor.setAt(0);
  editor.insert('s');
  editor.cursor.setAt(0);
  editor.insert('r');
  editor.cursor.setAt(0);
  editor.insert('q');
  editor.cursor.setAt(0);
  editor.insert('p');
  editor.cursor.setAt(0);
  editor.insert('o');
  editor.cursor.setAt(0);
  editor.insert('n');
  editor.cursor.setAt(0);
  editor.insert('m');
  editor.cursor.setAt(0);
  editor.insert('l');
  editor.cursor.setAt(0);
  editor.insert('k');
  editor.cursor.setAt(0);
  editor.insert('j');
  editor.cursor.setAt(0);
  editor.insert('i');
  editor.cursor.setAt(0);
  editor.insert('h');
  editor.cursor.setAt(0);
  editor.insert('g');
  editor.cursor.setAt(0);
  editor.insert('f');
  editor.cursor.setAt(0);
  editor.insert('e');
  editor.cursor.setAt(0);
  editor.insert('d');
  editor.cursor.setAt(0);
  editor.insert('c');
  editor.cursor.setAt(0);
  editor.insert('b');
  editor.cursor.setAt(0);
  editor.insert('a');
});

runInlineSlicesTests('written in reverse with deletes', (editor: Editor) => {
  editor.insert('z');
  editor.cursor.setAt(0);
  editor.insert('y');
  editor.cursor.setAt(0);
  editor.insert('x');
  editor.cursor.setAt(0);
  editor.insert('w');
  editor.cursor.setAt(0);
  editor.insert('v');
  editor.cursor.setAt(0);
  editor.insert('u');
  editor.cursor.setAt(0);
  editor.insert('t');
  editor.cursor.setAt(0);
  editor.insert('s');
  editor.cursor.setAt(0);
  editor.insert('r');
  editor.cursor.setAt(0);
  editor.insert('q');
  editor.cursor.setAt(0);
  editor.insert('p');
  editor.cursor.setAt(0);
  editor.insert('o');
  editor.cursor.setAt(0);
  editor.insert('n');
  editor.cursor.setAt(0);
  editor.insert('m');
  editor.cursor.setAt(0);
  editor.insert('l');
  editor.cursor.setAt(0);
  editor.insert('k');
  editor.cursor.setAt(0);
  editor.insert('j');
  editor.cursor.setAt(0);
  editor.insert('i');
  editor.cursor.setAt(0);
  editor.insert('h');
  editor.cursor.setAt(0);
  editor.insert('g');
  editor.cursor.setAt(0);
  editor.insert('f');
  editor.cursor.setAt(0);
  editor.insert('e');
  editor.cursor.setAt(0);
  editor.insert('d');
  editor.cursor.setAt(0);
  editor.insert('c');
  editor.cursor.setAt(0);
  editor.insert('b');
  editor.cursor.setAt(0);
  editor.insert('a');
  editor.cursor.setAt(0);
  editor.insert('123');
  editor.cursor.setAt(0, 3);
  editor.delBwd();
  editor.cursor.setAt(3);
  editor.insert('1');
  editor.cursor.setAt(3, 1);
  editor.delBwd();
});
