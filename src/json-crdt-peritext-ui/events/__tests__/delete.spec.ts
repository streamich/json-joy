import {Kit, runAlphabetKitTestSuite} from '../../../json-crdt-extensions/peritext/__tests__/setup';
import {PeritextEventDefaults} from '../PeritextEventDefaults';
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
};

describe('"delete" event', () => {
  runAlphabetKitTestSuite(testSuite);
});
