import {InlineAttrContained, InlineAttrEnd, InlineAttrPassing, InlineAttrStart} from '../block/Inline';
import type {LeafBlock} from '../block/LeafBlock';
import {SliceTypeName} from '../slice/constants';
import {type Kit, setupHelloWorldKit, setupHelloWorldWithFewEditsKit} from './setup';

const run = (setup: () => Kit) => {
  describe('inline', () => {
    test('creates two inline elements by annotating a slice at the beginning of the text', () => {
      const {peritext} = setup();
      peritext.editor.cursor.setAt(0, 5);
      peritext.editor.saved.insOne(123);
      peritext.editor.cursor.setAt(peritext.str.length());
      peritext.editor.delCursors();
      peritext.refresh();
      const leaf = peritext.blocks.root.children[0] as LeafBlock;
      expect(leaf.text()).toBe('hello world');
      const inline1 = [...leaf.texts()].find((inline) => inline.text() === 'hello')!;
      const inline2 = [...leaf.texts()].find((inline) => inline.text() === ' world')!;
      expect(inline1.text()).toBe('hello');
      expect(inline2.text()).toBe(' world');
      expect(inline1.attr()[123][0]).toBeInstanceOf(InlineAttrContained);
      expect(inline1.attr()[123][0].slice.data()).toBe(undefined);
      expect(inline2.attr()).toEqual({});
    });

    test('creates two inline elements by annotating a slice at the end of the text', () => {
      const {peritext} = setup();
      peritext.editor.cursor.setAt(6, 5);
      peritext.editor.saved.insOne(123);
      peritext.editor.cursor.setAt(peritext.str.length());
      peritext.refresh();
      const leaf = peritext.blocks.root.children[0] as LeafBlock;
      const inline1 = [...leaf.texts()].find((inline) => inline.text() === 'hello ')!;
      const inline2 = [...leaf.texts()].find((inline) => inline.text() === 'world')!;
      expect(inline1.text()).toBe('hello ');
      expect(inline2.text()).toBe('world');
      expect(inline1.attr()).toEqual({});
      expect(inline2.attr()[123][0]).toBeInstanceOf(InlineAttrContained);
    });

    test('creates three inline elements by annotating a slice in the middle of the text', () => {
      const {peritext} = setup();
      peritext.editor.cursor.setAt(3, 3);
      peritext.editor.saved.insOne('type', {foo: 'bar'});
      peritext.editor.cursor.setAt(peritext.str.length());
      peritext.refresh();
      const leaf = peritext.blocks.root.children[0] as LeafBlock;
      const inline1 = [...leaf.texts()].find((inline) => inline.text() === 'hel')!;
      const inline2 = [...leaf.texts()].find((inline) => inline.text() === 'lo ')!;
      const inline3 = [...leaf.texts()].find((inline) => inline.text() === 'world')!;
      expect(inline1.text()).toBe('hel');
      expect(inline2.text()).toBe('lo ');
      expect(inline3.text()).toBe('world');
      expect(inline1.attr()).toEqual({});
      expect(inline2.attr().type[0]).toBeInstanceOf(InlineAttrContained);
      expect(inline2.attr().type[0].slice.data()).toEqual({foo: 'bar'});
      expect(inline3.attr()).toEqual({});
    });

    describe('two interleaving annotations', () => {
      test('partial slices result in 5 inline nodes', () => {
        const {peritext} = setup();
        peritext.editor.cursor.setAt(3, 4);
        peritext.editor.saved.insStack('bold');
        peritext.editor.cursor.setAt(5, 4);
        peritext.editor.saved.insStack('italic');
        peritext.refresh();
        const leaf = peritext.blocks.root.children[0];
        const inline1 = [...leaf.texts()].find((inline) => inline.text() === 'hel')!;
        const inline2 = [...leaf.texts()].find((inline) => inline.text() === 'lo')!;
        const inline3 = [...leaf.texts()].find((inline) => inline.text() === ' w')!;
        const inline4 = [...leaf.texts()].find((inline) => inline.text() === 'or')!;
        const inline5 = [...leaf.texts()].find((inline) => inline.text() === 'ld')!;
        expect(leaf.text()).toBe('hello world');
        expect(inline1.attr()).toEqual({});
        expect(inline2.attr().bold[0]).toBeInstanceOf(InlineAttrStart);
        expect(inline2.attr().bold[0].slice.data()).toBe(undefined);
        expect(inline3.attr().bold[0]).toBeInstanceOf(InlineAttrEnd);
        expect(inline3.attr().bold[0].slice.data()).toBe(undefined);
        expect(inline3.attr().italic[0]).toBeInstanceOf(InlineAttrStart);
        expect(inline3.attr().italic[0].slice.data()).toBe(undefined);
        expect(inline3.attr()[SliceTypeName.Cursor][0]).toBeInstanceOf(InlineAttrStart);
        expect(inline4.attr().italic[0]).toBeInstanceOf(InlineAttrEnd);
        expect(inline4.attr().italic[0].slice.data()).toBe(undefined);
        expect(inline4.attr()[SliceTypeName.Cursor][0]).toBeInstanceOf(InlineAttrEnd);
        expect(inline5.attr()).toEqual({});
      });

      test('two completely overlaying slices result in 3 inline nodes', () => {
        const {peritext} = setup();
        peritext.editor.cursor.setAt(3, 4);
        peritext.editor.saved.insStack('bold');
        peritext.editor.saved.insStack('italic');
        peritext.refresh();
        const leaf = peritext.blocks.root.children[0];
        expect(leaf.text()).toBe('hello world');
        const inline1 = [...leaf.texts()].find((inline) => inline.text() === 'hel')!;
        const inline2 = [...leaf.texts()].find((inline) => inline.text() === 'lo w')!;
        const inline3 = [...leaf.texts()].find((inline) => inline.text() === 'orld')!;
        expect(inline1.attr()).toEqual({});
        expect(inline2.attr().bold[0]).toBeInstanceOf(InlineAttrContained);
        expect(inline2.attr().bold[0].slice.data()).toBe(undefined);
        expect(inline2.attr().italic[0]).toBeInstanceOf(InlineAttrContained);
        expect(inline2.attr().italic[0].slice.data()).toBe(undefined);
        expect(inline2.attr()[SliceTypeName.Cursor][0]).toBeInstanceOf(InlineAttrContained);
        expect(inline3.attr()).toEqual({});
      });

      test('two slices with the same start result in 4 inline nodes', () => {
        const {peritext} = setup();
        peritext.editor.cursor.setAt(3, 4);
        peritext.editor.saved.insStack('bold');
        peritext.editor.cursor.setAt(3, 5);
        peritext.editor.saved.insStack('italic');
        peritext.refresh();
        const leaf = peritext.blocks.root.children[0];
        expect(leaf.text()).toBe('hello world');
        const inline1 = [...leaf.texts()].find((inline) => inline.text() === 'hel')!;
        const inline2 = [...leaf.texts()].find((inline) => inline.text() === 'lo w')!;
        const inline3 = [...leaf.texts()].find((inline) => inline.text() === 'o')!;
        const inline4 = [...leaf.texts()].find((inline) => inline.text() === 'rld')!;
        expect(inline1.attr()).toEqual({});
        expect(inline2.attr().bold[0]).toBeInstanceOf(InlineAttrContained);
        expect(inline2.attr().bold[0].slice.data()).toBe(undefined);
        expect(inline2.attr().italic[0]).toBeInstanceOf(InlineAttrStart);
        expect(inline2.attr().italic[0].slice.data()).toBe(undefined);
        expect(inline2.attr()[SliceTypeName.Cursor][0]).toBeInstanceOf(InlineAttrStart);
        expect(inline3.attr().italic[0]).toBeInstanceOf(InlineAttrEnd);
        expect(inline3.attr().italic[0].slice.data()).toBe(undefined);
        expect(inline3.attr()[SliceTypeName.Cursor][0]).toBeInstanceOf(InlineAttrEnd);
        expect(inline4.attr()).toEqual({});
      });

      test('two slices with the same end result in 4 inline nodes', () => {
        const {peritext} = setup();
        peritext.editor.cursor.setAt(3, 4);
        peritext.editor.saved.insStack('bold');
        peritext.editor.cursor.setAt(4, 3);
        peritext.editor.saved.insStack('italic');
        peritext.refresh();
        const leaf = peritext.blocks.root.children[0];
        expect(leaf.text()).toBe('hello world');
        const inline1 = [...leaf.texts()].find((inline) => inline.text() === 'hel')!;
        const inline2 = [...leaf.texts()].find((inline) => inline.text() === 'l')!;
        const inline3 = [...leaf.texts()].find((inline) => inline.text() === 'o w')!;
        const inline4 = [...leaf.texts()].find((inline) => inline.text() === 'orld')!;
        expect(inline1.attr()).toEqual({});
        expect(inline2.attr().bold[0]).toBeInstanceOf(InlineAttrStart);
        expect(inline2.attr().bold[0].slice.data()).toBe(undefined);
        expect(inline3.attr().bold[0]).toBeInstanceOf(InlineAttrEnd);
        expect(inline3.attr().bold[0].slice.data()).toBe(undefined);
        expect(inline3.attr().italic[0]).toBeInstanceOf(InlineAttrContained);
        expect(inline3.attr().italic[0].slice.data()).toBe(undefined);
        expect(inline3.attr()[SliceTypeName.Cursor][0]).toBeInstanceOf(InlineAttrContained);
        expect(inline4.attr()).toEqual({});
      });

      test('two adjacent slices 4 inline nodes', () => {
        const {peritext} = setup();
        peritext.editor.cursor.setAt(3, 2);
        peritext.editor.saved.insStack('bold');
        peritext.editor.cursor.setAt(5, 3);
        peritext.editor.saved.insStack('italic');
        peritext.refresh();
        const leaf = peritext.blocks.root.children[0];
        expect(leaf.text()).toBe('hello world');
        const inline1 = [...leaf.texts()].find((inline) => inline.text() === 'hel')!;
        const inline2 = [...leaf.texts()].find((inline) => inline.text() === 'lo')!;
        const inline3 = [...leaf.texts()].find((inline) => inline.text() === ' wo')!;
        const inline4 = [...leaf.texts()].find((inline) => inline.text() === 'rld')!;
        expect(inline1.attr()).toEqual({});
        expect(inline2.attr().bold[0]).toBeInstanceOf(InlineAttrContained);
        expect(inline2.attr().bold[0].slice.data()).toBe(undefined);
        expect(inline3.attr().italic[0]).toBeInstanceOf(InlineAttrContained);
        expect(inline3.attr().italic[0].slice.data()).toBe(undefined);
        expect(inline3.attr()[SliceTypeName.Cursor][0]).toBeInstanceOf(InlineAttrContained);
        expect(inline4.attr()).toEqual({});
      });
    });
  });

  describe('block', () => {
    describe('with no overlays', () => {
      test('first block captures all text', () => {
        const {peritext} = setup();
        peritext.editor.cursor.setAt(3);
        peritext.refresh();
        expect(peritext.blocks.root.children[0].text()).toBe('hello world');
      });
    });

    test('two blocks capture the text', () => {
      const {peritext} = setup();
      peritext.editor.cursor.setAt(3);
      peritext.editor.saved.insMarker(['p'], '¶');
      peritext.refresh();
      const [block1, block2] = peritext.blocks.root.children;
      expect(block1.text()).toBe('hel');
      expect(block2.text()).toBe('lo world');
    });

    test('three blocks capture the text', () => {
      const {peritext} = setup();
      peritext.editor.cursor.setAt(3);
      peritext.editor.saved.insMarker(['p'], '¶');
      peritext.editor.cursor.setAt(8);
      peritext.editor.saved.insMarker(['blockquote'], {url: 'http:/...'});
      peritext.refresh();
      const [block1, block2, block3] = peritext.blocks.root.children;
      expect(block1.text()).toBe('hel');
      expect([...block1.texts()].length).toBe(1);
      expect([...block1.texts()][0].text()).toBe('hel');
      expect(block2.text()).toBe('lo w');
      expect([...block2.texts()].length).toBe(2);
      expect([...block2.texts()][0].text()).toBe('lo w');
      expect(block3.text()).toBe('orld');
      expect([...block3.texts()].length).toBe(1);
      expect([...block3.texts()][0].text()).toBe('orld');
    });

    test('slice each character into its own paragraph', () => {
      const {peritext} = setup();
      peritext.editor.cursor.setAt(1);
      peritext.editor.saved.insMarker(['p']);
      peritext.editor.cursor.setAt(3);
      peritext.editor.saved.insMarker(['p']);
      peritext.editor.cursor.setAt(5);
      peritext.editor.saved.insMarker(['p']);
      peritext.refresh();
      expect(peritext.blocks.root.children[0].text()).toBe('h');
      expect(peritext.blocks.root.children[1].text()).toBe('e');
      expect(peritext.blocks.root.children[2].text()).toBe('l');
      expect(peritext.blocks.root.children[3].text()).toBe('lo world');
    });

    test('inline slice across paragraph blocks works', () => {
      const {peritext} = setup();
      peritext.editor.cursor.setAt(3, 4);
      peritext.editor.saved.insStack('bold');
      peritext.editor.cursor.setAt(5);
      peritext.editor.saved.insMarker('p', {important: true});
      peritext.refresh();
      const block1 = peritext.blocks.root.children[0];
      const block2 = peritext.blocks.root.children[1];
      expect([...block1.texts()].length).toBe(3);
      expect([...block1.texts()][0].attr()).toEqual({});
      expect([...block1.texts()][1].attr().bold[0]).toBeInstanceOf(InlineAttrStart);
      expect([...block2.texts()].length).toBe(2);
      expect([...block2.texts()][0].attr().bold[0]).toBeInstanceOf(InlineAttrEnd);
      expect([...block2.texts()][1].attr()).toEqual({});
    });

    test('inline slice contains a whole block', () => {
      const {peritext} = setup();
      peritext.editor.cursor.setAt(3);
      peritext.editor.saved.insMarker(['p'], {});
      peritext.editor.cursor.setAt(6);
      peritext.editor.saved.insMarker(['p'], {});
      peritext.editor.cursor.setAt(2, 9);
      peritext.editor.saved.insStack('bold');
      peritext.refresh();
      const block1 = peritext.blocks.root.children[0];
      const block2 = peritext.blocks.root.children[1];
      const block3 = peritext.blocks.root.children[2];
      expect(block1.text()).toBe('hel');
      expect(block2.text()).toBe('lo');
      expect(block3.text()).toBe(' world');
      expect([...block1.texts()].length).toBe(2);
      expect([...block1.texts()][0].attr()).toEqual({});
      expect([...block1.texts()][1].attr().bold[0]).toBeInstanceOf(InlineAttrStart);
      expect([...block1.texts()][1].attr()[SliceTypeName.Cursor][0]).toBeInstanceOf(InlineAttrStart);
      expect([...block2.texts()].length).toBe(1);
      expect([...block2.texts()][0].attr().bold[0]).toBeInstanceOf(InlineAttrPassing);
      expect([...block2.texts()][0].attr()[SliceTypeName.Cursor][0]).toBeInstanceOf(InlineAttrPassing);
      expect([...block3.texts()].length).toBe(2);
      expect([...block3.texts()][0].attr().bold[0]).toBeInstanceOf(InlineAttrEnd);
      expect([...block3.texts()][0].attr()[SliceTypeName.Cursor][0]).toBeInstanceOf(InlineAttrEnd);
      expect([...block3.texts()][1].attr()).toEqual({});
    });
  });
};

describe('no edits "hello world"', () => {
  run(setupHelloWorldKit);
});

describe('some edits "hello world"', () => {
  run(setupHelloWorldWithFewEditsKit);
});
