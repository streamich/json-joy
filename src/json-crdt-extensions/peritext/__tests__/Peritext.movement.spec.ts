import {setupKit} from './setup';

test('can move back across single char block marker', () => {
  const {editor, peritext} = setupKit();
  editor.insert('ab');
  editor.cursor.setAt(1);
  editor.saved.insMarker(['p'], '\n');
  peritext.refresh();
  expect(peritext.blocks.root.children.length).toBe(2);
  editor.cursor.setAt(2);
  peritext.refresh();
  expect(peritext.blocks.root.children.length).toBe(2);
  editor.cursor.move(-1);
  peritext.refresh();
  expect(peritext.blocks.root.children.length).toBe(2);
});
