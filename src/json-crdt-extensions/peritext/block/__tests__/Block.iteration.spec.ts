import {setupHelloWorldKit} from '../../__tests__/setup';
import {OverlayPoint} from '../../overlay/OverlayPoint';

describe('points', () => {
  test('no iteration in empty document', () => {
    const {peritext} = setupHelloWorldKit();
    peritext.refresh();
    const blocks = peritext.blocks;
    const block = blocks.root.children[0]!;
    const iterator = block.points0();
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

  test('returns only points within that block, in two-block document', () => {
    const {peritext} = setupHelloWorldKit();
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
    expect(peritext.blocks.root.children.length).toBe(2);
    const block1 = peritext.blocks.root.children[0]!;
    const block2 = peritext.blocks.root.children[1]!;
    const points1 = [...block1.points()];
    const points2 = [...block2.points()];
    expect(points1.length).toBe(2);
    expect(points2.length).toBe(4);
  });
});
