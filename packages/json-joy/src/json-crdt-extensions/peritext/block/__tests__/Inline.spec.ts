import {type Kit, setupKit, setupNumbersKit, setupNumbersWithTombstonesKit} from '../../__tests__/setup';
import {SliceTypeName} from '../../slice/constants';
import {
  Inline,
  InlineAttrStartPoint,
  InlineAttrContained,
  InlineAttrEnd,
  InlineAttrPassing,
  InlineAttrStart,
} from '../Inline';

const runStrTests = (setup: () => Kit) => {
  describe('.str()', () => {
    test('concatenates parts of Inline correctly', () => {
      const {peritext} = setup();
      const overlay = peritext.overlay;
      const length = peritext.strApi().length();
      for (let i = 0; i < length; i++) {
        for (let j = 1; j <= length - i; j++) {
          peritext.editor.cursor.setAt(i, j);
          overlay.refresh();
          const [start, end] = [...overlay.points()];
          const inline = new Inline(peritext, start, end, start, end);
          const str = inline.text();
          expect(str).toBe(
            peritext
              .strApi()
              .view()
              .slice(i, i + j),
          );
        }
      }
    });
  });

  describe('.pos()', () => {
    test('returns correct offset in text', () => {
      const {peritext} = setup();
      const overlay = peritext.overlay;
      const length = peritext.strApi().length();
      for (let i = 0; i < length; i++) {
        for (let j = 1; j <= length - i; j++) {
          peritext.editor.cursor.setAt(i, j);
          overlay.refresh();
          const [start, end] = [...overlay.points()];
          const inline = new Inline(peritext, start, end, start, end);
          const pos = inline.pos();
          expect(pos).toBe(i);
        }
      }
    });
  });

  describe('.attr()', () => {
    test('returns all STACK annotations of a slice', () => {
      const {peritext} = setup();
      const overlay = peritext.overlay;
      peritext.editor.cursor.setAt(3, 3);
      peritext.editor.saved.insStack('bold', 1);
      peritext.editor.saved.insStack('bold', 2);
      peritext.editor.saved.insStack('em', 1);
      overlay.refresh();
      const [start, end] = [...overlay.points()];
      const inline = new Inline(peritext, start, end, start, end);
      const attr = inline.attr();
      expect(attr.bold[0].slice.data()).toEqual(1);
      expect(attr.bold[1].slice.data()).toEqual(2);
      expect(attr.em[0].slice.data()).toEqual(1);
    });

    test('returns latest OVERWRITE annotation', () => {
      const {peritext} = setup();
      const overlay = peritext.overlay;
      peritext.editor.cursor.setAt(3, 3);
      peritext.editor.saved.insOne('bold', 1);
      peritext.editor.saved.insOne('bold', 2);
      peritext.editor.saved.insOne('em', 1);
      overlay.refresh();
      const [start, end] = [...overlay.points()];
      const inline = new Inline(peritext, start, end, start, end);
      const attr = inline.attr();
      expect(attr.bold[0].slice.data()).toEqual(2);
      expect(attr.em[0].slice.data()).toEqual(1);
    });

    test('hides annotation hidden with another ERASE annotation', () => {
      const {peritext} = setup();
      const overlay = peritext.overlay;
      peritext.editor.cursor.setAt(3, 3);
      peritext.editor.saved.insOne('bold');
      peritext.editor.saved.insErase('bold');
      peritext.editor.saved.insOne('em');
      overlay.refresh();
      const [start, end] = [...overlay.points()];
      const inline = new Inline(peritext, start, end, start, end);
      const attr = inline.attr();
      expect(attr.bold).toBe(undefined);
      expect(attr.em[0]).toBeInstanceOf(InlineAttrContained);
      expect(attr.em[0].slice.data()).toEqual(undefined);
    });

    test('concatenates with "," steps of nested Path type annotations', () => {
      const {peritext} = setup();
      const overlay = peritext.overlay;
      peritext.editor.cursor.setAt(3, 3);
      peritext.editor.saved.insStack(['bold', 'very'], 1);
      peritext.editor.saved.insStack(['bold', 'normal'], 2);
      overlay.refresh();
      const [start, end] = [...overlay.points()];
      const inline = new Inline(peritext, start, end, start, end);
      const attr = inline.attr();
      expect(attr['bold,very'][0].slice.data()).toEqual(1);
      expect(attr['bold,normal'][0].slice.data()).toEqual(2);
    });

    test('returns collapsed slice (cursor) at marker position', () => {
      const {peritext} = setup();
      peritext.editor.cursor.setAt(3);
      const [paragraph] = peritext.editor.saved.insMarker('p');
      peritext.editor.cursor.set(paragraph.start);
      peritext.refresh();
      const block = peritext.blocks.root.children[1]!;
      const inline = [...block.texts()][0];
      const attr = inline.attr();
      expect(attr[SliceTypeName.Cursor][0]).toBeInstanceOf(InlineAttrStartPoint);
    });

    test('returns collapsed slice (cursor) at markup slice start', () => {
      const {peritext} = setup();
      peritext.editor.cursor.setAt(2, 2);
      const [slice] = peritext.editor.saved.insStack('bold', 123);
      peritext.editor.cursor.set(slice.start);
      peritext.refresh();
      const block = peritext.blocks.root.children[0]!;
      const inline = [...block.texts()][1];
      const attr = inline.attr();
      expect(attr[SliceTypeName.Cursor][0]).toBeInstanceOf(InlineAttrStartPoint);
      expect(attr.bold[0]).toBeInstanceOf(InlineAttrContained);
      expect(attr.bold[0].slice.data()).toBe(123);
    });

    test('returns slice and cursor at the same range', () => {
      const {peritext} = setup();
      peritext.editor.cursor.setAt(2, 2);
      peritext.editor.saved.insStack('bold', 123);
      peritext.refresh();
      const block = peritext.blocks.root.children[0]!;
      const inline1 = [...block.texts()][0];
      const inline2 = [...block.texts()][1];
      const inline3 = [...block.texts()][2];
      expect(inline1.attr()).toEqual({});
      expect(inline2.attr()[SliceTypeName.Cursor][0]).toBeInstanceOf(InlineAttrContained);
      expect(inline2.attr().bold[0]).toBeInstanceOf(InlineAttrContained);
      expect(inline2.attr().bold[0].slice.data()).toBe(123);
      expect(inline3.attr()).toEqual({});
    });

    test('can infer slice start', () => {
      const {peritext} = setup();
      peritext.editor.cursor.setAt(2, 2);
      peritext.editor.saved.insStack('bold', 123);
      peritext.refresh();
      const block = peritext.blocks.root.children[0]!;
      const inline1 = [...block.texts()][0];
      const inline2 = [...block.texts()][1];
      const inline3 = [...block.texts()][2];
      expect(inline1.attr()).toEqual({});
      expect(inline2.attr()[SliceTypeName.Cursor][0]).toBeInstanceOf(InlineAttrContained);
      expect(inline2.attr().bold[0]).toBeInstanceOf(InlineAttrContained);
      expect(inline2.attr().bold[0].slice.data()).toBe(123);
      expect(inline3.attr()).toEqual({});
    });

    describe('positioning', () => {
      test('correctly reports *Passing*, *Start*, and *End* positions', () => {
        const {peritext} = setup();
        peritext.editor.cursor.setAt(2, 3);
        peritext.editor.saved.insStack('bold');
        peritext.editor.cursor.setAt(4, 4);
        peritext.editor.extra.insStack('italic', 'very-italic');
        peritext.editor.cursor.setAt(1, 8);
        peritext.refresh();
        const str = peritext.strApi().view();
        const [inline1, inline2, inline3, inline4, inline5, inline6, inline7] =
          peritext.blocks.root.children[0]!.texts();
        expect(inline1.text()).toBe(str.slice(0, 1));
        expect(inline2.text()).toBe(str.slice(1, 2));
        expect(inline2.attr()[SliceTypeName.Cursor][0]).toBeInstanceOf(InlineAttrStart);
        expect(inline3.text()).toBe(str.slice(2, 4));
        expect(inline3.attr()[SliceTypeName.Cursor][0]).toBeInstanceOf(InlineAttrPassing);
        expect(inline3.attr().bold[0]).toBeInstanceOf(InlineAttrStart);
        expect(inline4.text()).toBe(str.slice(4, 5));
        expect(inline4.attr()[SliceTypeName.Cursor][0]).toBeInstanceOf(InlineAttrPassing);
        expect(inline4.attr().bold[0]).toBeInstanceOf(InlineAttrEnd);
        expect(inline4.attr().italic[0]).toBeInstanceOf(InlineAttrStart);
        expect(inline4.attr().italic[0].slice.data()).toEqual('very-italic');
        expect(inline5.text()).toBe(str.slice(5, 8));
        expect(inline5.attr()[SliceTypeName.Cursor][0]).toBeInstanceOf(InlineAttrPassing);
        expect(inline5.attr().italic[0]).toBeInstanceOf(InlineAttrEnd);
        expect(inline5.attr().italic[0].slice.data()).toEqual('very-italic');
        expect(inline6.text()).toBe(str.slice(8, 9));
        expect(inline6.attr()[SliceTypeName.Cursor][0]).toBeInstanceOf(InlineAttrEnd);
        expect(inline7.text()).toBe(str.slice(9));
      });

      test('correctly reports *Contained* positions', () => {
        const {peritext} = setup();
        peritext.editor.cursor.setAt(2, 6);
        const [slice] = peritext.editor.saved.insStack(['a', 1, 'b', 2]);
        peritext.editor.cursor.set(slice.start);
        peritext.refresh();
        const str = peritext.strApi().view();
        const [inline1, inline2, inline3] = peritext.blocks.root.children[0]!.texts();
        expect(inline1.text()).toBe(str.slice(0, 2));
        expect(inline2.text()).toBe(str.slice(2, 8));
        expect(inline2.attr()[SliceTypeName.Cursor][0]).toBeInstanceOf(InlineAttrStartPoint);
        expect(inline2.attr()['a,1,b,2'][0]).toBeInstanceOf(InlineAttrContained);
        expect(inline3.text()).toBe(str.slice(8));
      });

      test('correctly reports *Collapsed* positions', () => {
        const {peritext} = setup();
        peritext.editor.cursor.setAt(5);
        peritext.refresh();
        const str = peritext.strApi().view();
        const [inline1, inline2] = peritext.blocks.root.children[0]!.texts();
        expect(inline1.text()).toBe(str.slice(0, 5));
        expect(inline2.text()).toBe(str.slice(5));
        expect(inline2.attr()[SliceTypeName.Cursor][0]).toBeInstanceOf(InlineAttrStartPoint);
      });

      test('correctly reports *Collapsed* at start of block marker', () => {
        const {peritext} = setup();
        peritext.editor.cursor.setAt(5);
        const [paragraph] = peritext.editor.extra.insMarker('p');
        peritext.editor.cursor.set(paragraph.start);
        peritext.refresh();
        const str = peritext.strApi().view();
        const [block1, block2] = peritext.blocks.root.children;
        expect(block1.text()).toBe(str.slice(0, 5));
        const [inline2] = [...block2.texts()];
        expect(inline2.attr()[SliceTypeName.Cursor][0]).toBeInstanceOf(InlineAttrStartPoint);
      });
    });
  });
};

describe('Inline', () => {
  describe('lorem ipsum', () => {
    runStrTests(() => setupKit('lorem ipsum dolor sit amet'));
  });

  describe('numbers "0123456789", no edits', () => {
    runStrTests(setupNumbersKit);
  });

  describe('numbers "0123456789", with default schema and tombstones', () => {
    runStrTests(setupNumbersWithTombstonesKit);
  });

  describe('numbers "0123456789", with default schema and tombstones and constant sid', () => {
    runStrTests(() => setupNumbersWithTombstonesKit(12313123));
  });
});
