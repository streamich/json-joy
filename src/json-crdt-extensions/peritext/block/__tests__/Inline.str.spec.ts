import {Kit,  setupKit, setupNumbersKit, setupNumbersWithTombstonesKit} from '../../__tests__/setup';
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
          const str = inline.str();
          expect(str).toBe(peritext.strApi().view().slice(i, i + j));
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
