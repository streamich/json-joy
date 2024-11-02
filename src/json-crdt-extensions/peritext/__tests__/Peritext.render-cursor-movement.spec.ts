import {Anchor} from '../rga/constants';
import {render} from './render';
import {
  type Kit,
  setupAlphabetChunkSplitKit,
  setupAlphabetKit,
  setupAlphabetWithDeletesKit,
  setupAlphabetWithTwoChunksKit,
  setupAlphabetWrittenInReverse,
  setupAlphabetWrittenInReverseWithDeletes,
} from './setup';

const runInlineSlicesTests = (desc: string, getKit: () => Kit) => {
  const setup = () => {
    const kit = getKit();
    const view = () => {
      kit.peritext.refresh();
      return render(kit.peritext.blocks.root, '', false);
    };
    // console.log(peritext.str + '');
    return {...kit, view};
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
    "bcdefghijklmnopqrstuvwxyz" { -1 = [ !u ] }
"
`);
      editor.cursor.move(1);
      peritext.refresh();
      expect(view()).toMatchInlineSnapshot(`
"<>
  <0>
    "ab" {  }
    "cdefghijklmnopqrstuvwxyz" { -1 = [ !u ] }
"
`);
      editor.cursor.move(2);
      peritext.refresh();
      expect(view()).toMatchInlineSnapshot(`
"<>
  <0>
    "abcd" {  }
    "efghijklmnopqrstuvwxyz" { -1 = [ !u ] }
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
    "abcdefghijklmnopqrstuvwxyz" { -1 = [ !u ] }
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
    "bcdefghijklmnopqrstuvwxyz" { -1 = [ !u ] }
"
`);
      editor.cursor.move(2);
      peritext.refresh();
      // console.log(view());
      expect(view()).toMatchInlineSnapshot(`
"<>
  <0>
    "abc" {  }
    "defghijklmnopqrstuvwxyz" { -1 = [ !u ] }
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

runInlineSlicesTests('single text chunk', setupAlphabetKit);
runInlineSlicesTests('two chunks', setupAlphabetWithTwoChunksKit);
runInlineSlicesTests('with chunk split', setupAlphabetChunkSplitKit);
runInlineSlicesTests('with deletes', setupAlphabetWithDeletesKit);
runInlineSlicesTests('written in reverse', setupAlphabetWrittenInReverse);
runInlineSlicesTests('written in reverse with deletes', setupAlphabetWrittenInReverseWithDeletes);
