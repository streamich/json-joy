import {Model} from '../../../json-crdt/model';
import {Peritext} from '../Peritext';
import type {Editor} from '../editor/Editor';
import {render} from './render';

const setup = (insertNumbers = (editor: Editor) => editor.insert('Hello world!'), sid?: number) => {
  const model = Model.withLogicalClock(sid);
  model.api.set({
    text: '',
    slices: [],
  });
  const peritext = new Peritext(model, model.api.str(['text']).node, model.api.arr(['slices']).node);
  const editor = peritext.editor;
  insertNumbers(editor);
  const view = () => {
    peritext.refresh();
    return render(peritext.blocks.root, '', true);
  };
  // console.log(peritext.str + '');
  return {model, peritext, editor, view};
};

test('updates block hash on text input', () => {
  const {editor, peritext} = setup();
  // const {editor, peritext} = setup(undefined, 6015966450700167);
  let prevHash = 0;
  let hash = 0;
  editor.cursor.setAt(2);
  editor.insert('1');
  peritext.refresh();
  hash = peritext.blocks.root.children[0].hash;
  expect(hash).not.toBe(prevHash);
  prevHash = hash;
  editor.cursor.setAt(1);
  editor.insert('2');
  editor.insert('2');
  editor.insert('2');
  editor.insert('2');
  peritext.refresh();
  hash = peritext.blocks.root.children[0].hash;
  expect(hash).not.toBe(prevHash);
  prevHash = hash;
  editor.cursor.setAt(2);
  editor.insert('3');
  peritext.refresh();
  hash = peritext.blocks.root.children[0].hash;
  expect(hash).not.toBe(prevHash);
  prevHash = hash;
  editor.insert('3');
  peritext.refresh();
  hash = peritext.blocks.root.children[0].hash;
  expect(hash).not.toBe(prevHash);
  prevHash = hash;
  editor.insert('3');
  peritext.refresh();
  hash = peritext.blocks.root.children[0].hash;
  expect(hash).not.toBe(prevHash);
  prevHash = hash;
  editor.insert('3');
  peritext.refresh();
  hash = peritext.blocks.root.children[0].hash;
  expect(hash).not.toBe(prevHash);
  prevHash = hash;
  editor.insert('3');
  peritext.refresh();
  hash = peritext.blocks.root.children[0].hash;
  expect(hash).not.toBe(prevHash);
  prevHash = hash;
  editor.insert('3');
  peritext.refresh();
  hash = peritext.blocks.root.children[0].hash;
  expect(hash).not.toBe(prevHash);
  prevHash = hash;
  editor.insert('3');
  peritext.refresh();
  hash = peritext.blocks.root.children[0].hash;
  expect(hash).not.toBe(prevHash);
  prevHash = hash;
  editor.insert('3');
  peritext.refresh();
  hash = peritext.blocks.root.children[0].hash;
  expect(hash).not.toBe(prevHash);
  prevHash = hash;
  editor.insert('3');
  peritext.refresh();
  hash = peritext.blocks.root.children[0].hash;
  expect(hash).not.toBe(prevHash);
  prevHash = hash;
});

test('updates block hash when moving across deleted char', () => {
  const {editor, peritext} = setup();
  editor.cursor.setAt(5);
  editor.insert('1');
  peritext.refresh();
  const hash1 = peritext.blocks.root.children[0].hash;
  editor.cursor.move(-1);
  peritext.refresh();
  const hash2 = peritext.blocks.root.children[0].hash;
  expect(hash1).not.toBe(hash2);
});

test('updates block after moving over new block boundary', () => {
  const {editor, peritext} = setup();
  editor.cursor.setAt(6);
  editor.saved.insMarker(['p'], '\n');
  peritext.refresh();
  const hash11 = peritext.blocks.root.children[0].hash;
  const hash12 = peritext.blocks.root.children[1].hash;
  editor.cursor.move(1);
  peritext.refresh();
  const hash21 = peritext.blocks.root.children[0].hash;
  const hash22 = peritext.blocks.root.children[1].hash;
  expect(hash11).not.toBe(hash21);
  expect(hash12).not.toBe(hash22);
});
