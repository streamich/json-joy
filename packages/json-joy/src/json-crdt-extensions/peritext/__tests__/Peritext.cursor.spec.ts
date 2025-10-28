import {InlineAttrStartPoint, InlineAttrContained} from '../block/Inline';
import {SliceTypeName} from '../slice/constants';
import {setupKit} from './setup';

const setup = () => {
  const kit = setupKit();
  kit.peritext.strApi().ins(0, 'ab');
  return kit;
};

test('cursor at the start of string and slice annotation at the start of string', () => {
  const {peritext, editor} = setup();
  editor.cursor.setAt(0, 1);
  editor.saved.insOne('bold');
  editor.cursor.setAt(0);
  peritext.refresh();
  const blocks = peritext.blocks.root;
  const leaf = blocks.children[0];
  const inlines = [...leaf.texts()];
  const inline1 = inlines[0];
  const inline2 = inlines[1];
  const inline3 = inlines[2];
  expect(inlines.length).toBe(3);
  expect(inline1.text()).toBe('');
  expect(inline2.text()).toBe('a');
  expect(inline3.text()).toBe('b');
  expect(inline1.attr()[SliceTypeName.Cursor][0]).toBeInstanceOf(InlineAttrStartPoint);
  expect(inline2.attr().bold[0]).toBeInstanceOf(InlineAttrContained);
  expect(inline3.attr()).toEqual({});
});

test('cursor walking over character marked as bold', () => {
  const {peritext, editor} = setup();
  editor.cursor.setAt(0, 1);
  editor.saved.insStack('bold');
  editor.cursor.setAt(0);
  peritext.refresh();
  editor.cursor.move(1);
  peritext.refresh();
  const blocks = peritext.blocks.root;
  const leaf = blocks.children[0];
  const inlines = [...leaf.texts()];
  const inline1 = inlines[0];
  const inline2 = inlines[1];
  const inline3 = inlines[2];
  expect(inlines.length).toBe(3);
  expect(inline1.text()).toBe('');
  expect(inline2.text()).toBe('a');
  expect(inline3.text()).toBe('b');
  expect(inline2.attr().bold[0]).toBeInstanceOf(InlineAttrContained);
  expect(inline3.attr()[SliceTypeName.Cursor][0]).toBeInstanceOf(InlineAttrStartPoint);
  // expect(inline2.attr()).toEqual({bold: [[void 0], InlineAttrPos.Contained]});
  // expect(inline3.attr()).toEqual({
  //   [SliceTypes.Cursor]: [[[CursorAnchor.Start, void 0]], InlineAttrPos.Collapsed],
  // });
  editor.cursor.move(1);
  peritext.refresh();
});

test('cursor walking over character marked as bold and one more', () => {
  const {peritext, editor} = setup();
  editor.cursor.setAt(0, 1);
  editor.saved.insOne('bold');
  editor.cursor.setAt(0);
  peritext.refresh();
  editor.cursor.move(1);
  editor.cursor.move(1);
  peritext.refresh();
  const blocks = peritext.blocks.root;
  const leaf = blocks.children[0];
  const inlines = [...leaf.texts()];
  const [inline1, inline2, inline3, inline4] = inlines;
  expect(inlines.length).toBe(4);
  expect(inline1.text()).toBe('');
  expect(inline2.text()).toBe('a');
  expect(inline3.text()).toBe('b');
  expect(inline4.text()).toBe('');
  expect(inline2.attr().bold[0]).toBeInstanceOf(InlineAttrContained);
  // expect(inline2.attr()).toEqual({bold: [1, InlineAttrPos.Contained]});
  expect(inline3.attr()).toEqual({});
  expect(inline4.attr()[SliceTypeName.Cursor][0]).toBeInstanceOf(InlineAttrStartPoint);
  // expect(inline4.attr()).toEqual({
  //   [SliceTypes.Cursor]: [[[CursorAnchor.Start, void 0]], InlineAttrPos.Collapsed],
  // });
});

test('cursor can move across block boundary forwards', () => {
  const {peritext, editor} = setup();
  editor.cursor.setAt(1);
  editor.saved.insMarker(['p'], '\n');
  editor.cursor.setAt(0);
  peritext.refresh();
  // console.log(peritext + '');
  expect(peritext.blocks.root.children.length).toBe(2);
  expect([...peritext.blocks.root.children[0].texts()].length).toBe(1);
  expect([...peritext.blocks.root.children[0].texts()][0].text()).toBe('a');
  expect([...peritext.blocks.root.children[0].texts()][0].attr()[SliceTypeName.Cursor][0]).toBeInstanceOf(
    InlineAttrStartPoint,
  );
  editor.cursor.move(1);
  peritext.refresh();
  expect(peritext.blocks.root.children.length).toBe(2);
  expect([...peritext.blocks.root.children[0].texts()].length).toBe(2);
  expect([...peritext.blocks.root.children[0].texts()][0].text()).toBe('a');
  expect([...peritext.blocks.root.children[0].texts()][0].attr()).toEqual({});
  expect([...peritext.blocks.root.children[0].texts()][1].text()).toBe('');
  expect([...peritext.blocks.root.children[0].texts()][1].attr()[SliceTypeName.Cursor][0]).toBeInstanceOf(
    InlineAttrStartPoint,
  );
  expect([...peritext.blocks.root.children[1].texts()].length).toBe(1);
  expect([...peritext.blocks.root.children[1].texts()][0].text()).toBe('b');
  expect([...peritext.blocks.root.children[1].texts()][0].attr()).toEqual({});
  editor.cursor.move(1);
  peritext.refresh();
  // console.log(peritext + '');
  expect(peritext.blocks.root.children.length).toBe(2);
  expect([...peritext.blocks.root.children[0].texts()].length).toBe(1);
  expect([...peritext.blocks.root.children[0].texts()][0].text()).toBe('a');
  expect([...peritext.blocks.root.children[0].texts()][0].attr()).toEqual({});
  expect([...peritext.blocks.root.children[1].texts()].length).toBe(1);
  expect([...peritext.blocks.root.children[1].texts()][0].text()).toBe('b');
  expect([...peritext.blocks.root.children[1].texts()][0].attr()[SliceTypeName.Cursor][0]).toBeInstanceOf(
    InlineAttrStartPoint,
  );
  editor.cursor.move(1);
  peritext.refresh();
  expect(peritext.blocks.root.children.length).toBe(2);
  expect([...peritext.blocks.root.children[0].texts()].length).toBe(1);
  expect([...peritext.blocks.root.children[0].texts()][0].text()).toBe('a');
  expect([...peritext.blocks.root.children[0].texts()][0].attr()).toEqual({});
  expect([...peritext.blocks.root.children[1].texts()].length).toBe(2);
  expect([...peritext.blocks.root.children[1].texts()][0].text()).toBe('b');
  expect([...peritext.blocks.root.children[1].texts()][0].attr()).toEqual({});
  expect([...peritext.blocks.root.children[1].texts()][1].text()).toBe('');
  expect([...peritext.blocks.root.children[1].texts()][1].attr()[SliceTypeName.Cursor][0]).toBeInstanceOf(
    InlineAttrStartPoint,
  );
});
