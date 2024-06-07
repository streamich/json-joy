import {Kit, setupKit, setupNumbersKit, setupNumbersWithTombstonesKit} from '../../__tests__/setup';
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
      expect(attr.bold).toEqual([1, 2]);
      expect(attr.em).toEqual([1]);
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
      expect(attr.bold).toBe(2);
      expect(attr.em).toBe(1);
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
      expect(attr.em).toBe(1);
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
      expect(attr['bold,very']).toEqual([1]);
      expect(attr['bold,normal']).toEqual([2]);
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
