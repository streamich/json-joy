import {setupHelloWorldKit} from '../../__tests__/setup';
import {MarkerOverlayPoint} from '../../overlay/MarkerOverlayPoint';
import {Block} from '../Block';
import {LeafBlock} from '../LeafBlock';

test('can construct block representation of a document without markers', () => {
  const {peritext} = setupHelloWorldKit();
  peritext.refresh();
  const blocks = peritext.blocks;
  expect(blocks.root.children.length).toBe(1);
  const block = blocks.root.children[0];
  expect(block instanceof LeafBlock).toBe(true);
  expect(block.path).toEqual([0]);
  expect(block.marker).toBe(undefined);
});

test('can construct a two-paragraph document', () => {
  const {peritext} = setupHelloWorldKit();
  peritext.editor.cursor.setAt(6);
  peritext.editor.saved.insMarker('p');
  peritext.refresh();
  const blocks = peritext.blocks;
  const paragraph1 = blocks.root.children[0];
  const paragraph2 = blocks.root.children[1];
  expect(blocks.root instanceof Block).toBe(true);
  expect(blocks.root.children.length).toBe(2);
  expect(paragraph1 instanceof LeafBlock).toBe(true);
  expect(paragraph2 instanceof LeafBlock).toBe(true);
  expect(paragraph1.path).toEqual([0]);
  expect(paragraph2.path).toEqual(['p']);
  expect(paragraph1.marker).toBe(undefined);
  expect(paragraph2.marker instanceof MarkerOverlayPoint).toBe(true);
});

test('first inline element does not contain marker text', () => {
  const {peritext} = setupHelloWorldKit();
  peritext.editor.cursor.setAt(6);
  peritext.editor.saved.insMarker('p');
  peritext.editor.delCursors();
  peritext.refresh();
  expect(peritext.strApi().view()).toBe('hello \nworld');
  const [block1, block2] = peritext.blocks.root.children;
  expect([...block1.texts()][0].text()).toBe('hello ');
  expect([...block2.texts()][0].text()).toBe('world');
});
