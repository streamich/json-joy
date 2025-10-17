import {setupHelloWorldKit} from '../../__tests__/setup';
import {MarkerOverlayPoint} from '../../overlay/MarkerOverlayPoint';
import {OverlayPoint} from '../../overlay/OverlayPoint';

const setupTwoBlockDocument = () => {
  const kit = setupHelloWorldKit();
  const {peritext} = kit;
  peritext.editor.cursor.setAt(1, 2);
  peritext.editor.saved.insStack('bold');
  peritext.editor.cursor.setAt(7, 2);
  peritext.editor.saved.insStack('italic');
  peritext.editor.cursor.setAt(8, 2);
  peritext.editor.saved.insStack('underline');
  peritext.editor.cursor.setAt(6);
  peritext.editor.saved.insMarker('p');
  peritext.editor.delCursors();
  peritext.refresh();
  return kit;
};

describe('points', () => {
  test('no iteration in empty document', () => {
    const {peritext} = setupHelloWorldKit();
    peritext.refresh();
    const blocks = peritext.blocks;
    const block = blocks.root.children[0]!;
    const iterator = block.points0();
    expect(iterator()).toBe(undefined);
  });

  test('using flag, can receive START marker in empty document', () => {
    const {peritext} = setupHelloWorldKit();
    peritext.refresh();
    const blocks = peritext.blocks;
    const block = blocks.root.children[0]!;
    const iterator = block.points0(true);
    expect(iterator()).toBeInstanceOf(OverlayPoint);
    expect(iterator()).toBe(undefined);
  });

  test('returns all overlay points in single block document', () => {
    const {peritext} = setupHelloWorldKit();
    peritext.editor.cursor.setAt(3, 3);
    peritext.editor.saved.insStack('bold');
    peritext.refresh();
    const block = peritext.blocks.root.children[0]!;
    const iterator = block.points0();
    const point1 = iterator();
    const point2 = iterator();
    const point3 = iterator();
    expect(point1).toBeInstanceOf(OverlayPoint);
    expect(point2).toBeInstanceOf(OverlayPoint);
    expect(point3).toBe(undefined);
  });

  test('returns all overlay points in single block document, including start marker', () => {
    const {peritext} = setupHelloWorldKit();
    peritext.editor.cursor.setAt(3, 3);
    peritext.editor.saved.insStack('bold');
    peritext.refresh();
    const block = peritext.blocks.root.children[0]!;
    const iterator = block.points0(true);
    expect(iterator()).toBeInstanceOf(OverlayPoint);
    expect(iterator()).toBeInstanceOf(OverlayPoint);
    expect(iterator()).toBeInstanceOf(OverlayPoint);
    expect(iterator()).toBe(undefined);
  });

  test('returns only points within that block, in two-block document', () => {
    const {peritext} = setupTwoBlockDocument();
    expect(peritext.blocks.root.children.length).toBe(2);
    const block1 = peritext.blocks.root.children[0]!;
    const block2 = peritext.blocks.root.children[1]!;
    const points1 = [...block1.points()];
    const points2 = [...block2.points()];
    expect(points1.length).toBe(2);
    expect(points2.length).toBe(4);
  });

  test('can iterate including marker points, in two-block document', () => {
    const {peritext} = setupTwoBlockDocument();
    expect(peritext.blocks.root.children.length).toBe(2);
    const block1 = peritext.blocks.root.children[0]!;
    const block2 = peritext.blocks.root.children[1]!;
    const points1 = [...block1.points(true)];
    const points2 = [...block2.points(true)];
    expect(points1.length).toBe(3);
    expect(points2.length).toBe(5);
    expect(points1[0]).toBeInstanceOf(OverlayPoint);
    expect(points1[0]).toBe(peritext.overlay.START);
    expect(points2[0]).toBeInstanceOf(MarkerOverlayPoint);
  });
});

describe('texts', () => {
  test('in markup-less document', () => {
    const {peritext} = setupHelloWorldKit();
    peritext.refresh();
    const blocks = peritext.blocks;
    const block = blocks.root.children[0]!;
    const text = [...block.texts()].map((inline) => inline.text()).join('');
    expect(text).toBe('hello world');
  });

  test('can iterate through all text chunks in two-block documents', () => {
    const {peritext} = setupTwoBlockDocument();
    expect(peritext.blocks.root.children.length).toBe(2);
    const block1 = peritext.blocks.root.children[0]!;
    const block2 = peritext.blocks.root.children[1]!;
    const text1 = [...block1.texts()].map((inline) => inline.text()).join('');
    const text2 = [...block2.texts()].map((inline) => inline.text()).join('');
    expect(text1).toBe('hello ');
    expect(text2).toBe('world');
  });
});
