import {setupHelloWorldKit} from '../../__tests__/setup';
import {Block} from '../Block';
import {LeafBlock} from '../LeafBlock';

test('can construct a two-paragraph document', () => {
  const {peritext} = setupHelloWorldKit();
  peritext.editor.cursor.setAt(6);
  peritext.editor.saved.insMarker('p');
  peritext.refresh();
  const blocks = peritext.blocks;
  const paragraph1 = blocks.root.children[0];
  const paragraph2 = blocks.root.children[1];
  expect(blocks.root instanceof Block).toBe(true);
  expect(paragraph1 instanceof LeafBlock).toBe(true);
  expect(paragraph2 instanceof LeafBlock).toBe(true);
  expect(paragraph1.path).toEqual([0]);
  expect(paragraph2.path).toEqual(['p']);
});
