import {type Kit, runAlphabetKitTestSuite} from '../../../json-crdt-extensions/peritext/__tests__/setup';
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

  describe('with absolute position ("at" property set)', () => {
    test('can set the caret at the document start', async () => {
      const kit = setup();
      kit.et.cursor({at: 0});
      expect(kit.editor.cursor.start.viewPos()).toBe(0);
      expect(kit.editor.cursor.isCollapsed()).toBe(true);
      expect(kit.editor.cursor.start.rightChar()?.view()).toBe('a');
    });

    test('can set the caret at the document using Point instance', async () => {
      const kit = setup();
      kit.et.cursor({at: kit.peritext.pointStart()!});
      expect(kit.editor.cursor.start.viewPos()).toBe(0);
      expect(kit.editor.cursor.isCollapsed()).toBe(true);
      expect(kit.editor.cursor.start.rightChar()?.view()).toBe('a');
    });

    test('can set the caret at the document end', async () => {
      const kit = setup();
      kit.et.cursor({at: kit.editor.text().length});
      expect(kit.editor.cursor.start.viewPos()).toBe(kit.editor.text().length);
      expect(kit.editor.cursor.isCollapsed()).toBe(true);
      expect(kit.editor.cursor.start.leftChar()?.view()).toBe('z');
    });

    test('can set the caret at the document using Point instance', async () => {
      const kit = setup();
      kit.et.cursor({at: kit.peritext.pointEnd()!});
      expect(kit.editor.cursor.start.viewPos()).toBe(kit.editor.text().length);
      expect(kit.editor.cursor.isCollapsed()).toBe(true);
      expect(kit.editor.cursor.start.leftChar()?.view()).toBe('z');
    });

    test('can set the caret in the middle of document', async () => {
      const kit = setup();
      const view = kit.editor.text();
      for (let i = 0; i <= view.length; i++) {
        kit.et.cursor({at: i});
        expect(kit.editor.cursor.start.viewPos()).toBe(i);
        expect(kit.editor.cursor.start.leftChar()?.view()).toBe(view[i - 1]);
        expect(kit.editor.cursor.start.rightChar()?.view()).toBe(view[i]);
        kit.et.cursor({at: [i, 0]});
        expect(kit.editor.cursor.start.viewPos()).toBe(i);
        expect(kit.editor.cursor.start.leftChar()?.view()).toBe(view[i - 1]);
        expect(kit.editor.cursor.start.rightChar()?.view()).toBe(view[i]);
        kit.et.cursor({at: kit.peritext.pointAt(i)!});
        expect(kit.editor.cursor.start.viewPos()).toBe(i);
        expect(kit.editor.cursor.start.leftChar()?.view()).toBe(view[i - 1]);
        expect(kit.editor.cursor.start.rightChar()?.view()).toBe(view[i]);
      }
      for (let i = 0; i < view.length; i++) {
        kit.et.cursor({at: [i, 1]});
        expect(kit.editor.cursor.start.viewPos()).toBe(i + 1);
        expect(kit.editor.cursor.start.leftChar()?.view()).toBe(view[i]);
        expect(kit.editor.cursor.start.rightChar()?.view()).toBe(view[i + 1]);
      }
    });
  });
};

describe('"cursor" event', () => {
  runAlphabetKitTestSuite(testSuite);
});
