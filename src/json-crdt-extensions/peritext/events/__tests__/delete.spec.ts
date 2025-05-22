import {type Kit, runAlphabetKitTestSuite} from '../../../../json-crdt-extensions/peritext/__tests__/setup';
import {PeritextEventDefaults} from '../defaults/PeritextEventDefaults';
import {PeritextEventTarget} from '../PeritextEventTarget';

const testSuite = (getKit: () => Kit) => {
  const setup = () => {
    const kit = getKit();
    const et = new PeritextEventTarget();
    const defaults = new PeritextEventDefaults(kit.peritext, et);
    et.defaults = defaults;
    return {...kit, et};
  };

  test('can delete by a single character backwards', async () => {
    const kit = setup();
    kit.editor.cursor.setAt(10);
    expect(kit.peritext.str.view()).toBe('abcdefghijklmnopqrstuvwxyz');
    kit.et.delete(-1);
    expect(kit.peritext.str.view()).toBe('abcdefghiklmnopqrstuvwxyz');
    kit.et.delete(-1);
    expect(kit.peritext.str.view()).toBe('abcdefghklmnopqrstuvwxyz');
    kit.editor.cursor.setAt(5);
    kit.et.delete(-1);
    expect(kit.peritext.str.view()).toBe('abcdfghklmnopqrstuvwxyz');
  });

  describe('characters', () => {
    describe('can delete all characters backwards', () => {
      test('one character at a time', async () => {
        const kit = setup();
        const view = kit.peritext.str.view() as string;
        const length = view.length;
        kit.editor.cursor.setAt(view.length);
        expect(kit.peritext.str.view()).toBe(view);
        for (let i = length - 1; i >= 0; i--) {
          kit.et.delete(-1);
          expect(kit.peritext.str.view()).toBe(view.slice(0, i));
        }
        expect(kit.peritext.str.view()).toBe('');
        kit.peritext.refresh();
        expect(kit.peritext.str.view()).toBe('');
      });

      test('two characters at a time', async () => {
        const kit = setup();
        const view = kit.peritext.str.view() as string;
        const step = 2;
        kit.editor.cursor.setAt(view.length);
        let i = 1;
        expect(kit.peritext.str.view()).toBe(view);
        while (kit.editor.text()) {
          kit.et.delete(-step);
          expect(kit.peritext.str.view()).toBe(view.slice(0, view.length - i * step));
          i++;
        }
        expect(kit.peritext.str.view()).toBe('');
      });

      test('five characters at a time', async () => {
        const kit = setup();
        const view = kit.peritext.str.view() as string;
        const step = 5;
        kit.editor.cursor.setAt(view.length);
        let i = 1;
        expect(kit.peritext.str.view()).toBe(view);
        while (kit.editor.text()) {
          kit.et.delete(-step);
          if (!kit.editor.text()) break;
          expect(kit.peritext.str.view()).toBe(view.slice(0, view.length - i * step));
          i++;
        }
        expect(kit.editor.text()).toBe('');
      });
    });

    describe('can delete all characters forwards', () => {
      test('one character at a time', async () => {
        const kit = setup();
        const view = kit.peritext.str.view() as string;
        const length = view.length;
        kit.editor.cursor.setAt(0);
        expect(kit.peritext.str.view()).toBe(view);
        for (let i = 1; i <= length; i++) {
          kit.et.delete(1);
          expect(kit.editor.text()).toBe(view.slice(i));
        }
        expect(kit.peritext.str.view()).toBe('');
        kit.peritext.refresh();
        expect(kit.peritext.str.view()).toBe('');
      });

      test('two characters at a time', async () => {
        const kit = setup();
        const view = kit.peritext.str.view() as string;
        const step = 2;
        kit.editor.cursor.setAt(0);
        let i = 1;
        expect(kit.peritext.str.view()).toBe(view);
        while (kit.editor.text()) {
          kit.et.delete(step);
          expect(kit.peritext.str.view()).toBe(view.slice(i * step));
          i++;
        }
        expect(kit.peritext.str.view()).toBe('');
      });

      test('five characters at a time', async () => {
        const kit = setup();
        const view = kit.peritext.str.view() as string;
        const step = 5;
        kit.editor.cursor.setAt(0);
        let i = 1;
        expect(kit.peritext.str.view()).toBe(view);
        while (kit.editor.text()) {
          kit.et.delete(step);
          if (!kit.editor.text()) break;
          expect(kit.peritext.str.view()).toBe(view.slice(i * step));
          i++;
        }
        expect(kit.editor.text()).toBe('');
      });
    });
  });

  describe('words', () => {
    test('can delete a word backwards', async () => {
      const kit = setup();
      kit.editor.cursor.setAt(10);
      kit.et.insert(' ');
      kit.editor.cursor.setAt(5);
      kit.et.insert(' ');
      kit.editor.cursor.setAt(8);
      expect(kit.editor.text()).toBe('abcde fghij klmnopqrstuvwxyz');
      kit.et.delete(-1, 'word');
      expect(kit.editor.text()).toBe('abcde hij klmnopqrstuvwxyz');
    });

    test('can delete a word forwards', async () => {
      const kit = setup();
      kit.editor.cursor.setAt(10);
      kit.et.insert(' ');
      kit.editor.cursor.setAt(5);
      kit.et.insert(' ');
      kit.editor.cursor.setAt(8);
      expect(kit.editor.text()).toBe('abcde fghij klmnopqrstuvwxyz');
      kit.et.delete(1, 'word');
      expect(kit.editor.text()).toBe('abcde fg klmnopqrstuvwxyz');
    });

    test('can delete a word in both directions', async () => {
      const kit = setup();
      kit.editor.cursor.setAt(10);
      kit.et.insert(' ');
      kit.editor.cursor.setAt(5);
      kit.et.insert(' ');
      kit.editor.cursor.setAt(8);
      expect(kit.editor.text()).toBe('abcde fghij klmnopqrstuvwxyz');
      kit.et.delete({
        move: [
          ['start', 'word', -1],
          ['end', 'word', 1],
        ],
      });
      expect(kit.editor.text()).toBe('abcde  klmnopqrstuvwxyz');
    });

    test('can delete a word at specific position', async () => {
      const kit = setup();
      kit.editor.cursor.setAt(10);
      kit.et.insert(' ');
      kit.editor.cursor.setAt(5);
      kit.et.insert(' ');
      kit.editor.delCursors();
      expect(kit.editor.text()).toBe('abcde fghij klmnopqrstuvwxyz');
      kit.et.delete({
        at: [8],
        move: [
          ['start', 'word', -1],
          ['end', 'word', 1],
        ],
        add: true,
      });
      expect(kit.editor.text()).toBe('abcde  klmnopqrstuvwxyz');
      expect(kit.editor.cursor.start.viewPos()).toBe(6);
      expect(kit.editor.cursor.isCollapsed()).toBe(true);
      kit.et.delete({
        at: [0],
        move: [
          ['start', 'word', -1],
          ['end', 'word', 1],
        ],
        add: true,
      });
      expect(kit.editor.text()).toBe('  klmnopqrstuvwxyz');
      expect(kit.editor.cursor.start.viewPos()).toBe(0);
      expect(kit.editor.cursor.isCollapsed()).toBe(true);
      kit.et.delete({
        at: [10],
        move: [
          ['start', 'word', -1],
          ['end', 'word', 1],
        ],
        add: true,
      });
      expect(kit.editor.text()).toBe('  ');
      expect(kit.editor.cursor.start.viewPos()).toBe(2);
      expect(kit.editor.cursor.isCollapsed()).toBe(true);
    });
  });

  describe('lines', () => {
    test('can delete a line backwards', async () => {
      const kit = setup();
      kit.editor.cursor.setAt(10);
      kit.et.insert('\n');
      kit.editor.cursor.setAt(5);
      kit.et.insert('\n');
      kit.editor.cursor.setAt(8);
      expect(kit.editor.text()).toBe('abcde\nfghij\nklmnopqrstuvwxyz');
      kit.et.delete(-1, 'line');
      expect(kit.editor.text()).toBe('abcde\nhij\nklmnopqrstuvwxyz');
    });

    test('can delete a line forwards', async () => {
      const kit = setup();
      kit.editor.cursor.setAt(10);
      kit.et.insert('\n');
      kit.editor.cursor.setAt(5);
      kit.et.insert('\n');
      kit.editor.cursor.setAt(8);
      expect(kit.editor.text()).toBe('abcde\nfghij\nklmnopqrstuvwxyz');
      kit.et.delete(1, 'line');
      expect(kit.editor.text()).toBe('abcde\nfg\nklmnopqrstuvwxyz');
    });

    test('can delete a word in both directions', async () => {
      const kit = setup();
      kit.editor.cursor.setAt(10);
      kit.et.insert('\n');
      kit.editor.cursor.setAt(5);
      kit.et.insert('\n');
      kit.editor.cursor.setAt(8);
      expect(kit.editor.text()).toBe('abcde\nfghij\nklmnopqrstuvwxyz');
      kit.et.delete({
        move: [
          ['start', 'line', -1],
          ['end', 'line', 1],
        ],
      });
      expect(kit.editor.text()).toBe('abcde\n\nklmnopqrstuvwxyz');
    });
  });
};

describe('"delete" event', () => {
  runAlphabetKitTestSuite(testSuite);
});
