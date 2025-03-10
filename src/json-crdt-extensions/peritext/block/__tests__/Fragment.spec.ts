import {setupHelloWorldKit} from '../../__tests__/setup';
import {MarkerOverlayPoint} from '../../overlay/MarkerOverlayPoint';
import {Block} from '../Block';
import {LeafBlock} from '../LeafBlock';
import {CommonSliceType} from '../../slice';
import {type Kit, runAlphabetKitTestSuite} from '../../__tests__/setup';
import {Inline} from '../Inline';

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

const runTests = (setup: () => Kit) => {
  describe('"abcdefghijklmnopqrstuvwxyz"', () => {
    test('paragraph + blockquote with inline formatting', () => {
      const {editor, peritext} = setup();
      editor.cursor.setAt(10);
      editor.saved.insMarker(CommonSliceType.blockquote);
      editor.cursor.setAt(13, 2);
      editor.saved.insOne(CommonSliceType.b);
      peritext.refresh();
      const range = peritext.rangeAt(4, 10);
      const fragment = peritext.fragment(range);
      fragment.refresh();
      expect(fragment.root instanceof Block).toBe(true);
      expect(fragment.root.children.length).toBe(2);
      const [paragraph, blockquote] = fragment.root.children;
      expect(paragraph instanceof LeafBlock).toBe(true);
      expect(blockquote instanceof LeafBlock).toBe(true);
      expect(paragraph.path).toEqual([CommonSliceType.p]);
      expect(paragraph.text()).toBe('efghij');
      expect(blockquote.path).toEqual([CommonSliceType.blockquote]);
      expect(blockquote.text()).toBe('klm');
      const [inline1, inline2] = [...blockquote.texts()];
      expect(inline1 instanceof Inline).toBe(true);
      expect(inline2 instanceof Inline).toBe(true);
      expect(inline1.text()).toBe('kl');
      expect(inline2.text()).toBe('m');
      expect(!!inline1.attr()[CommonSliceType.b]).toBe(false);
      expect(!!inline2.attr()[CommonSliceType.b]).toBe(true);
    });

    test('explicit paragraph + blockquote with inline formatting', () => {
      const {editor, peritext} = setup();
      editor.cursor.setAt(10);
      editor.saved.insMarker(CommonSliceType.blockquote);
      editor.cursor.setAt(13, 2);
      editor.saved.insOne(CommonSliceType.b);
      editor.cursor.setAt(5);
      editor.saved.insMarker(CommonSliceType.p);
      peritext.refresh();
      const range = peritext.rangeAt(4, 11);
      const fragment = peritext.fragment(range);
      fragment.refresh();
      expect(fragment.root instanceof Block).toBe(true);
      expect(fragment.root.children.length).toBe(3);
      const [paragraph1, paragraph2, blockquote] = fragment.root.children;
      expect(paragraph1 instanceof LeafBlock).toBe(true);
      expect(paragraph2 instanceof LeafBlock).toBe(true);
      expect(blockquote instanceof LeafBlock).toBe(true);
      expect(paragraph1.path).toEqual([CommonSliceType.p]);
      expect(paragraph1.text()).toBe('e');
      expect(paragraph2.path).toEqual([CommonSliceType.p]);
      expect(paragraph2.text()).toBe('fghij');
      expect(blockquote.path).toEqual([CommonSliceType.blockquote]);
      expect(blockquote.text()).toBe('klm');
      const [inline1, inline2] = [...blockquote.texts()];
      expect(inline1 instanceof Inline).toBe(true);
      expect(inline2 instanceof Inline).toBe(true);
      expect(inline1.text()).toBe('kl');
      expect(inline2.text()).toBe('m');
      expect(!!inline1.attr()[CommonSliceType.b]).toBe(false);
      expect(!!inline2.attr()[CommonSliceType.b]).toBe(true);
    });

    test('explicit paragraph + blockquote with inline formatting (start middle of second paragraph)', () => {
      const {editor, peritext} = setup();
      editor.cursor.setAt(10);
      editor.saved.insMarker(CommonSliceType.blockquote);
      editor.cursor.setAt(13, 2);
      editor.saved.insOne(CommonSliceType.b);
      editor.cursor.setAt(5);
      editor.saved.insMarker(CommonSliceType.p);
      peritext.refresh();
      const range = peritext.rangeAt(7, 8);
      const fragment = peritext.fragment(range);
      fragment.refresh();
      expect(fragment.root instanceof Block).toBe(true);
      expect(fragment.root.children.length).toBe(2);
      const [paragraph1, blockquote] = fragment.root.children;
      expect(paragraph1 instanceof LeafBlock).toBe(true);
      expect(blockquote instanceof LeafBlock).toBe(true);
      expect(paragraph1.path).toEqual([CommonSliceType.p]);
      expect(paragraph1.text()).toBe('ghij');
      expect(blockquote.path).toEqual([CommonSliceType.blockquote]);
      expect(blockquote.text()).toBe('klm');
      const [inline1, inline2] = [...blockquote.texts()];
      expect(inline1 instanceof Inline).toBe(true);
      expect(inline2 instanceof Inline).toBe(true);
      expect(inline1.text()).toBe('kl');
      expect(inline2.text()).toBe('m');
      expect(!!inline1.attr()[CommonSliceType.b]).toBe(false);
      expect(!!inline2.attr()[CommonSliceType.b]).toBe(true);
    });

    test('explicit paragraph + blockquote with inline formatting (start and end in the middle of second paragraph)', () => {
      const {editor, peritext} = setup();
      editor.cursor.setAt(10);
      editor.saved.insMarker(CommonSliceType.blockquote);
      editor.cursor.setAt(13, 2);
      editor.saved.insOne(CommonSliceType.b);
      editor.cursor.setAt(5);
      editor.saved.insMarker(CommonSliceType.p);
      peritext.refresh();
      const range = peritext.rangeAt(7, 2);
      const fragment = peritext.fragment(range);
      fragment.refresh();
      expect(fragment.root instanceof Block).toBe(true);
      expect(fragment.root.children.length).toBe(1);
      const [paragraph1] = fragment.root.children;
      expect(paragraph1 instanceof LeafBlock).toBe(true);
      expect(paragraph1.path).toEqual([CommonSliceType.p]);
      expect(paragraph1.text()).toBe('gh');
      expect([...paragraph1.texts()].length).toBe(1);
      const [inline1] = [...paragraph1.texts()];
      expect(inline1.text()).toBe('gh');
    });

    test('explicit paragraph + blockquote with inline formatting (end before blockquote)', () => {
      const {editor, peritext} = setup();
      editor.cursor.setAt(10);
      editor.saved.insMarker(CommonSliceType.blockquote);
      editor.cursor.setAt(13, 2);
      editor.saved.insOne(CommonSliceType.b);
      editor.cursor.setAt(5);
      editor.saved.insMarker(CommonSliceType.p);
      peritext.refresh();
      const range = peritext.rangeAt(2, 6);
      const fragment = peritext.fragment(range);
      fragment.refresh();
      expect(fragment.root instanceof Block).toBe(true);
      expect(fragment.root.children.length).toBe(2);
      const [paragraph1, paragraph2] = fragment.root.children;
      expect(paragraph1 instanceof LeafBlock).toBe(true);
      expect(paragraph2 instanceof LeafBlock).toBe(true);
      expect(paragraph1.path).toEqual([CommonSliceType.p]);
      expect(paragraph1.text()).toBe('cde');
      expect(paragraph2.path).toEqual([CommonSliceType.p]);
      expect(paragraph2.text()).toBe('fg');
    });
  });
};

describe('Fragment.toJson()', () => {
  runAlphabetKitTestSuite(runTests);
});
