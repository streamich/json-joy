import {Kit, setupKit, setupNumbersKit, setupNumbersWithTombstonesKit} from '../../__tests__/setup';
import {CursorAnchor, SliceTypes} from '../../slice/constants';
import {Inline} from '../Inline';

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
          const inline = Inline.create(peritext, start, end);
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
          const inline = Inline.create(peritext, start, end);
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
      const inline = Inline.create(peritext, start, end);
      const attr = inline.attr();
      expect(attr.bold[0]).toEqual([1, 2]);
      expect(attr.em[0]).toEqual([1]);
    });

    test('returns latest OVERWRITE annotation', () => {
      const {peritext} = setup();
      const overlay = peritext.overlay;
      peritext.editor.cursor.setAt(3, 3);
      peritext.editor.saved.insOverwrite('bold', 1);
      peritext.editor.saved.insOverwrite('bold', 2);
      peritext.editor.saved.insOverwrite('em', 1);
      overlay.refresh();
      const [start, end] = [...overlay.points()];
      const inline = Inline.create(peritext, start, end);
      const attr = inline.attr();
      expect(attr.bold[0]).toBe(2);
      expect(attr.em[0]).toBe(1);
    });

    test('hides annotation hidden with another ERASE annotation', () => {
      const {peritext} = setup();
      const overlay = peritext.overlay;
      peritext.editor.cursor.setAt(3, 3);
      peritext.editor.saved.insOverwrite('bold');
      peritext.editor.saved.insErase('bold');
      peritext.editor.saved.insOverwrite('em');
      overlay.refresh();
      const [start, end] = [...overlay.points()];
      const inline = Inline.create(peritext, start, end);
      const attr = inline.attr();
      expect(attr.bold).toBe(undefined);
      expect(attr.em[0]).toBe(1);
    });

    test('concatenates with "," steps of nested Path type annotations', () => {
      const {peritext} = setup();
      const overlay = peritext.overlay;
      peritext.editor.cursor.setAt(3, 3);
      peritext.editor.saved.insStack(['bold', 'very'], 1);
      peritext.editor.saved.insStack(['bold', 'normal'], 2);
      overlay.refresh();
      const [start, end] = [...overlay.points()];
      const inline = Inline.create(peritext, start, end);
      const attr = inline.attr();
      expect(attr['bold,very'][0]).toEqual([1]);
      expect(attr['bold,normal'][0]).toEqual([2]);
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
      expect(attr).toEqual({
        [SliceTypes.Cursor]: [[[CursorAnchor.Start]], expect.any(Number)],
      });
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
      expect(attr).toEqual({
        [SliceTypes.Cursor]: [[[CursorAnchor.Start]], expect.any(Number)],
        bold: [[123], expect.any(Number)],
      });
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
      expect(inline2.attr()).toEqual({
        [SliceTypes.Cursor]: [[[CursorAnchor.Start]], expect.any(Number)],
        bold: [[123], expect.any(Number)],
      });
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
      expect(inline2.attr()).toEqual({
        [SliceTypes.Cursor]: [[[CursorAnchor.Start]], expect.any(Number)],
        bold: [[123], expect.any(Number)],
      });
      expect(inline3.attr()).toEqual({});
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
