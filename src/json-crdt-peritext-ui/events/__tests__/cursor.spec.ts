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
    describe('caret', () => {
      test('can set the caret at the document start', () => {
        const kit = setup();
        kit.et.cursor({at: 0});
        expect(kit.editor.cursor.start.viewPos()).toBe(0);
        expect(kit.editor.cursor.isCollapsed()).toBe(true);
        expect(kit.editor.cursor.start.rightChar()?.view()).toBe('a');
      });

      test('can set the caret at the document start using Point instance', () => {
        const kit = setup();
        kit.et.cursor({at: kit.peritext.pointStart()!});
        expect(kit.editor.cursor.start.viewPos()).toBe(0);
        expect(kit.editor.cursor.isCollapsed()).toBe(true);
        expect(kit.editor.cursor.start.rightChar()?.view()).toBe('a');
      });

      test('can set the caret at the document end', () => {
        const kit = setup();
        kit.et.cursor({at: kit.editor.text().length});
        expect(kit.editor.cursor.start.viewPos()).toBe(kit.editor.text().length);
        expect(kit.editor.cursor.isCollapsed()).toBe(true);
        expect(kit.editor.cursor.start.leftChar()?.view()).toBe('z');
      });

      test('can set the caret at the document end using Point instance', () => {
        const kit = setup();
        kit.et.cursor({at: kit.peritext.pointEnd()!});
        expect(kit.editor.cursor.start.viewPos()).toBe(kit.editor.text().length);
        expect(kit.editor.cursor.isCollapsed()).toBe(true);
        expect(kit.editor.cursor.start.leftChar()?.view()).toBe('z');
      });

      test('can set the caret in the middle of document', () => {
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

    describe('selection', () => {
      test('can set selection at the document start', () => {
        const kit = setup();
        kit.et.cursor({at: 0, len: 3});
        expect(kit.editor.cursor.start.viewPos()).toBe(0);
        expect(kit.editor.cursor.isCollapsed()).toBe(false);
        expect(kit.editor.cursor.text()).toBe('abc');
      });

      test('can set selection at the document start using Point instance', () => {
        const kit = setup();
        kit.et.cursor({at: kit.peritext.pointStart()!, len: 5});
        expect(kit.editor.cursor.start.viewPos()).toBe(0);
        expect(kit.editor.cursor.isCollapsed()).toBe(false);
        expect(kit.editor.cursor.text()).toBe('abcde');
      });

      test('can set selection at the end of document', () => {
        const kit = setup();
        kit.et.cursor({at: 5, len: 123});
        expect(kit.editor.cursor.text()).toBe(kit.editor.text().slice(5));
        expect(kit.editor.cursor.length()).toBe(kit.editor.text().length - 5);
        expect(kit.editor.cursor.isCollapsed()).toBe(false);
      });

      test('can set selection at the document end using Point instance', () => {
        const kit = setup();
        kit.et.cursor({at: kit.peritext.pointAt(5), len: 123});
        expect(kit.editor.cursor.text()).toBe(kit.editor.text().slice(5));
        expect(kit.editor.cursor.length()).toBe(kit.editor.text().length - 5);
        expect(kit.editor.cursor.isCollapsed()).toBe(false);
      });

      test('can select various document ranges', () => {
        const kit = setup();
        const view = kit.editor.text();
        const lengths = [1, 2, 3, 5, 7, 13, 19];
        for (const length of lengths) {
          for (let i = 0; i < view.length - length; i++) {
            kit.et.cursor({at: i, len: length});
            expect(kit.editor.cursor.text()).toBe(view.slice(i, i + length));
          }
        }
      });

      test('can select various document ranges (using negative length)', () => {
        const kit = setup();
        const view = kit.editor.text();
        const lengths = [1, 2, 3, 5, 7, 13, 19];
        for (const length of lengths) {
          for (let i = length; i < view.length; i++) {
            kit.et.cursor({at: i, len: -length});
            expect(kit.editor.cursor.text()).toBe(view.slice(i - length, i));
          }
        }
      });

      test('anchor and focus depends on the sign of the length', () => {
        const kit = setup();
        kit.et.cursor({at: 15, len: 3});
        expect(kit.editor.cursor.text()).toBe('pqr');
        expect(kit.editor.cursor.isEndFocused()).toBe(true);
        kit.et.cursor({at: 15, len: -3});
        expect(kit.editor.cursor.text()).toBe('mno');
        expect(kit.editor.cursor.isStartFocused()).toBe(true);
      });

      test('range selection can use "unit" prop to specify step size', () => {
        const kit = setup();
        kit.et.cursor({at: 4});
        kit.et.insert(' ');
        kit.et.cursor({at: 9});
        kit.et.insert(' ');
        kit.et.cursor({at: 2});
        kit.et.cursor({at: 2, len: 2, unit: 'word'});
        expect(kit.editor.cursor.text()).toBe('cd efgh');
      });
    });
  });

  test.todo('leaves only one cursor when caret is set');
};

describe('"cursor" event', () => {
  runAlphabetKitTestSuite(testSuite);
});
