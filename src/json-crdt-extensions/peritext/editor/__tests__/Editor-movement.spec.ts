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

describe('one character movements', () => {
  test('move start to end one char at-a-time', () => {
    const {editor} = setup((editor) => editor.insert('abc'));
    editor.cursor.setAt(0);
    expect(editor.cursor.start.viewPos()).toBe(0);
    expect(editor.cursor.end.viewPos()).toBe(0);
    editor.cursor.end.step(1);
    editor.cursor.set(editor.cursor.end);
    expect(editor.cursor.start.viewPos()).toBe(1);
    expect(editor.cursor.end.viewPos()).toBe(1);
    editor.cursor.end.step(1);
    editor.cursor.set(editor.cursor.end);
    expect(editor.cursor.start.viewPos()).toBe(2);
    expect(editor.cursor.end.viewPos()).toBe(2);
    editor.cursor.end.step(1);
    editor.cursor.set(editor.cursor.end);
    expect(editor.cursor.start.viewPos()).toBe(3);
    expect(editor.cursor.end.viewPos()).toBe(3);
    editor.cursor.end.step(1);
    editor.cursor.set(editor.cursor.end);
    expect(editor.cursor.start.viewPos()).toBe(3);
    expect(editor.cursor.end.viewPos()).toBe(3);
  });

  test('move end to start one char at-a-time', () => {
    const {editor} = setup((editor) => editor.insert('abc'));
    editor.cursor.set(editor.end()!);
    expect(editor.cursor.start.viewPos()).toBe(3);
    expect(editor.cursor.end.viewPos()).toBe(3);
    editor.cursor.end.step(1);
    editor.cursor.end.step(-1);
    editor.cursor.set(editor.cursor.end);
    expect(editor.cursor.start.viewPos()).toBe(2);
    expect(editor.cursor.end.viewPos()).toBe(2);
    editor.cursor.end.step(1);
    editor.cursor.end.step(-2);
    editor.cursor.set(editor.cursor.end);
    expect(editor.cursor.start.viewPos()).toBe(1);
    expect(editor.cursor.end.viewPos()).toBe(1);
    editor.cursor.end.step(-1);
    editor.cursor.set(editor.cursor.end);
    expect(editor.cursor.start.viewPos()).toBe(0);
    expect(editor.cursor.end.viewPos()).toBe(0);
    editor.cursor.end.step(-1);
    editor.cursor.set(editor.cursor.end);
    expect(editor.cursor.start.viewPos()).toBe(0);
    expect(editor.cursor.end.viewPos()).toBe(0);
    editor.cursor.end.step(-2);
    editor.cursor.set(editor.cursor.end);
    expect(editor.cursor.start.viewPos()).toBe(0);
    expect(editor.cursor.end.viewPos()).toBe(0);
    editor.cursor.end.step(-5);
    editor.cursor.set(editor.cursor.end);
    expect(editor.cursor.start.viewPos()).toBe(0);
    expect(editor.cursor.end.viewPos()).toBe(0);
  });
});
