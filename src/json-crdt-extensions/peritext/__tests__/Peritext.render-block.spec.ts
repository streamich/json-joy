import {Model} from '../../../json-crdt/model';
import {Peritext} from '../Peritext';
import type {Editor} from '../editor/Editor';
import {render} from './render';

const runInlineSlicesTests = (
  desc: string,
  insertNumbers = (editor: Editor) => void editor.insert('abcdefghijklmnopqrstuvwxyz'),
) => {
  const setup = () => {
    const model = Model.create();
    model.api.set({
      text: '',
      slices: [],
    });
    const peritext = new Peritext(model, model.api.str(['text']).node, model.api.arr(['slices']).node);
    const editor = peritext.editor;
    editor.cursor.setAt(0);
    insertNumbers(editor);
    const view = () => {
      editor.delCursors();
      peritext.refresh();
      return render(peritext.blocks.root);
    };
    // console.log(peritext.str + '');
    return {model, peritext, editor, render, view};
  };

  describe(desc, () => {
    test('can insert marker in the middle of text', () => {
      const {view, editor} = setup();
      editor.cursor.setAt(10);
      editor.saved.insMarker(['p'], {foo: 'bar'});
      expect(view()).toMatchInlineSnapshot(`
"<>
  <0>
    "abcdefghij" {  }
  <p> { foo = "bar" }
    "klmnopqrstuvwxyz" {  }
"
`);
    });

    test('can insert at the beginning of text', () => {
      const {view, editor} = setup();
      editor.cursor.setAt(0);
      editor.saved.insMarker(['p'], {foo: 'bar'});
      expect(view()).toMatchInlineSnapshot(`
"<>
  <p> { foo = "bar" }
    "abcdefghijklmnopqrstuvwxyz" {  }
"
`);
    });

    test('can insert at the end of text', () => {
      const {view, editor} = setup();
      editor.cursor.setAt(26);
      editor.saved.insMarker(['unfurl'], {link: 'foobar'});
      expect(view()).toMatchInlineSnapshot(`
"<>
  <0>
    "abcdefghijklmnopqrstuvwxyz" {  }
  <unfurl> { link = "foobar" }
"
`);
    });

    test('can split text after slice', () => {
      const {view, editor} = setup();
      editor.cursor.setAt(5, 5);
      editor.saved.insOne('BOLD');
      editor.cursor.setAt(15);
      editor.saved.insMarker(['paragraph'], []);
      expect(view()).toMatchInlineSnapshot(`
"<>
  <0>
    "abcde" {  }
    "fghij" { BOLD = [ !u ] }
    "klmno" {  }
  <paragraph> [  ]
    "pqrstuvwxyz" {  }
"
`);
    });

    test('can split text right after slice', () => {
      const {view, editor} = setup();
      editor.cursor.setAt(5, 5);
      editor.saved.insOne('BOLD');
      editor.cursor.setAt(10);
      editor.saved.insMarker(['paragraph'], []);
      expect(view()).toMatchInlineSnapshot(`
"<>
  <0>
    "abcde" {  }
    "fghij" { BOLD = [ !u ] }
    "" {  }
  <paragraph> [  ]
    "klmnopqrstuvwxyz" {  }
"
`);
    });

    test('can split text before slice', () => {
      const {view, editor} = setup();
      editor.cursor.setAt(15, 5);
      editor.saved.insOne('BOLD');
      editor.cursor.setAt(10);
      editor.saved.insMarker(['paragraph'], []);
      expect(view()).toMatchInlineSnapshot(`
"<>
  <0>
    "abcdefghij" {  }
  <paragraph> [  ]
    "klmno" {  }
    "pqrst" { BOLD = [ !u ] }
    "uvwxyz" {  }
"
`);
    });

    test('can split text right before slice', () => {
      const {view, editor} = setup();
      editor.cursor.setAt(15, 5);
      editor.saved.insOne('BOLD');
      editor.cursor.setAt(15);
      editor.saved.insMarker(['paragraph'], []);
      expect(view()).toMatchInlineSnapshot(`
"<>
  <0>
    "abcdefghijklmno" {  }
  <paragraph> [  ]
    "pqrst" { BOLD = [ !u ] }
    "uvwxyz" {  }
"
`);
    });

    test('can split text in the middle of a slice', () => {
      const {view, editor} = setup();
      editor.cursor.setAt(5, 10);
      editor.saved.insOne('BOLD');
      editor.cursor.setAt(10);
      editor.saved.insMarker(['paragraph'], []);
      expect(view()).toMatchInlineSnapshot(`
"<>
  <0>
    "abcde" {  }
    "fghij" { BOLD = [ !u ] }
  <paragraph> [  ]
    "klmno" { BOLD = [ !u ] }
    "pqrstuvwxyz" {  }
"
`);
    });

    test('can annotate with slice over two block splits', () => {
      const {view, editor} = setup();
      editor.cursor.setAt(10);
      editor.saved.insMarker(['p'], []);
      editor.cursor.setAt(15);
      editor.saved.insMarker(['p'], []);
      editor.cursor.setAt(8, 15);
      editor.saved.insOne('BOLD');
      expect(view()).toMatchInlineSnapshot(`
"<>
  <0>
    "abcdefgh" {  }
    "ij" { BOLD = [ !u ] }
  <p> [  ]
    "klmn" { BOLD = [ !u ] }
  <p> [  ]
    "opqrstu" { BOLD = [ !u ] }
    "vwxyz" {  }
"
`);
    });

    test('can insert two blocks', () => {
      const {view, editor} = setup();
      editor.cursor.setAt(10);
      editor.saved.insMarker('p', {});
      editor.cursor.setAt(10 + 10 + 1);
      editor.saved.insMarker('p', {});
      expect(view()).toMatchInlineSnapshot(`
"<>
  <0>
    "abcdefghij" {  }
  <p> {  }
    "klmnopqrst" {  }
  <p> {  }
    "uvwxyz" {  }
"
`);
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
  editor.del();
  editor.cursor.setAt(3);
  editor.insert('opqrstuv');
  editor.cursor.setAt(12, 1);
  editor.del();
  editor.cursor.setAt(0);
  editor.insert('ab1c3defghijk4444');
  editor.cursor.setAt(2, 1);
  editor.del();
  editor.cursor.setAt(3, 1);
  editor.del();
  editor.cursor.setAt(11, 4);
  editor.del();
});
