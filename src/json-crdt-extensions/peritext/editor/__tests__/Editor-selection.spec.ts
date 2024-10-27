import {Model} from '../../../../json-crdt/model';
import {Peritext} from '../../Peritext';
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

describe('.range()', () => {
  test('can select a word', () => {
    const {editor, peritext} = setup((editor) => {
      editor.insert("const {editor} = setup(editor => editor.insert('Hello world!'));");
    });
    peritext.overlay.refresh();
    const range = editor.range(peritext.pointAt(2), 'word');
    expect(range?.text()).toBe('const');
    const range2 = editor.range(peritext.pointAt(9), 'word');
    expect(range2?.text()).toBe('editor');
    const range3 = editor.range(peritext.pointAt(20), 'word');
    expect(range3?.text()).toBe('setup');
  });

  test('can select punctuation', () => {
    const {editor, peritext} = setup((editor) => {
      editor.insert("const {editor} = setup(editor => editor.insert('Hello world!'));");
    });
    peritext.refresh();
    console.log(peritext + '');
    const point = peritext.pointAt(6);
    console.log(point + '');
    const range = editor.range(point, 'word');
    expect(range?.text()).toBe('{');
    // const range1 = editor.range(peritext.pointAt(30), 'word');
    // expect(range1?.text()).toBe('=>');
  });

  // test('can select punctuation at the end of text', () => {
  //   const {editor, peritext} = setup((editor) => {
  //     editor.insert("const {editor} = setup(editor => editor.insert('Hello world!'));");
  //   });
  //   peritext.overlay.refresh();
  //   const range = editor.wordRange(peritext.pointAt(peritext.str.length() - 1));
  //   expect(range?.text()).toBe("!'));");
  //   const range2 = editor.wordRange(peritext.pointAt(peritext.str.length() - 3));
  //   expect(range2?.text()).toBe("!'));");
  // });

  // test('can select whitespace', () => {
  //   const {editor, peritext} = setup((editor) => {
  //     editor.insert("const {editor} = setup(editor => editor.insert('Hello world!'));");
  //   });
  //   peritext.overlay.refresh();
  //   const range = editor.wordRange(peritext.pointAt(5));
  //   expect(range?.text()).toBe(' ');
  // });
});
