import {type Kit, runAlphabetKitTestSuite} from '../../../json-crdt-extensions/peritext/__tests__/setup';
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

      test('can move specific edge of selection', () => {
        const kit = setup();
        kit.et.cursor({at: 12, len: 5});
        expect(kit.editor.cursor.text()).toBe('mnopq');
        kit.et.cursor({at: 14, edge: 'focus'});
        expect(kit.editor.cursor.text()).toBe('mn');
        kit.et.cursor({at: 10, edge: 'anchor'});
        expect(kit.editor.cursor.text()).toBe('klmn');
        kit.et.cursor({at: 16, edge: 'anchor'});
        expect(kit.editor.cursor.text()).toBe('op');
        kit.et.cursor({at: 0, edge: 'focus'});
        expect(kit.editor.cursor.text()).toBe('abcdefghijklmnop');
      });

      test('when specific cursor edge is moved caret is expanded to a range', () => {
        const kit = setup();
        kit.et.cursor({at: 5});
        expect(kit.editor.cursor.text()).toBe('');
        kit.et.cursor({at: 7, edge: 'focus'});
        expect(kit.editor.cursor.text()).toBe('fg');
      });
    });

    describe('"new" edge', () => {
      test('can insert new carets into the document', () => {
        const kit = setup();
        kit.editor.delCursors();
        expect(kit.editor.cursorCount()).toBe(0);
        kit.et.cursor({at: 5, edge: 'new'});
        expect(kit.editor.cursorCount()).toBe(1);
        kit.et.cursor({at: 12, edge: 'new'});
        expect(kit.editor.cursorCount()).toBe(2);
        kit.et.cursor({at: 21, edge: 'new'});
        expect(kit.editor.cursorCount()).toBe(3);
        kit.et.insert('_');
        expect(kit.editor.text()).toBe('abcde_fghijkl_mnopqrstu_vwxyz');
      });

      test('leaves only one cursor when caret is set', () => {
        const kit = setup();
        kit.editor.delCursors();
        expect(kit.editor.cursorCount()).toBe(0);
        kit.et.cursor({at: 5, edge: 'new'});
        expect(kit.editor.cursorCount()).toBe(1);
        kit.et.cursor({at: 12, edge: 'new'});
        expect(kit.editor.cursorCount()).toBe(2);
        kit.et.cursor({at: 10});
        expect(kit.editor.cursorCount()).toBe(1);
        expect(kit.editor.cursor.start.viewPos()).toBe(10);
      });
    });
  });

  describe('with relative position ("at" property not set)', () => {
    describe('can move a specific edge', () => {
      test('can move focus relative amount of chars', () => {
        const kit = setup();
        kit.et.cursor({at: 2, len: 2});
        expect(kit.editor.cursor.text()).toBe('cd');
        kit.et.cursor({len: 3, edge: 'focus'});
        expect(kit.editor.cursor.text()).toBe('cdefg');
        kit.et.cursor({len: -6, edge: 'focus'});
        expect(kit.editor.cursor.text()).toBe('b');
        kit.et.cursor({len: -1, edge: 'focus'});
        expect(kit.editor.cursor.text()).toBe('ab');
        kit.et.cursor({len: -1, edge: 'focus'});
        expect(kit.editor.cursor.text()).toBe('ab');
        kit.et.cursor({len: -1, edge: 'focus'});
        expect(kit.editor.cursor.text()).toBe('ab');
      });

      test('can move anchor relative amount of chars', () => {
        const kit = setup();
        kit.et.cursor({at: 2, len: 2});
        expect(kit.editor.cursor.text()).toBe('cd');
        kit.et.cursor({len: -5, edge: 'anchor'});
        expect(kit.editor.cursor.text()).toBe('abcd');
        kit.et.cursor({len: 1, edge: 'anchor'});
        expect(kit.editor.cursor.text()).toBe('bcd');
        kit.et.cursor({len: 1, edge: 'anchor'});
        expect(kit.editor.cursor.text()).toBe('cd');
        kit.et.cursor({len: 1, edge: 'anchor'});
        expect(kit.editor.cursor.text()).toBe('d');
        kit.et.cursor({len: 1, edge: 'anchor'});
        expect(kit.editor.cursor.text()).toBe('');
        kit.et.cursor({len: 1, edge: 'anchor'});
        expect(kit.editor.cursor.text()).toBe('e');
        kit.et.cursor({len: 1, edge: 'anchor'});
        expect(kit.editor.cursor.text()).toBe('ef');
        kit.et.cursor({len: 1, edge: 'anchor'});
        expect(kit.editor.cursor.text()).toBe('efg');
        kit.et.cursor({len: 123, edge: 'anchor'});
        expect(kit.editor.cursor.text()).toBe('efghijklmnopqrstuvwxyz');
      });

      test('can move "focus" edge in word units', () => {
        const kit = setup();
        kit.et.cursor({at: 2});
        kit.et.insert(' ');
        kit.et.cursor({at: 5});
        kit.et.insert(' ');
        kit.et.cursor({at: 9});
        kit.et.insert(' ');
        kit.et.cursor({at: 1});
        expect(kit.editor.cursor.text()).toBe('');
        kit.et.cursor({len: 1, unit: 'word', edge: 'focus'});
        expect(kit.editor.cursor.text()).toBe('b');
        expect(kit.editor.cursor.isEndFocused()).toBe(true);
        kit.et.cursor({len: 1, unit: 'word', edge: 'focus'});
        expect(kit.editor.cursor.text()).toBe('b cd');
        kit.et.cursor({len: 1, unit: 'word', edge: 'focus'});
        expect(kit.editor.cursor.text()).toBe('b cd efg');
        kit.et.cursor({len: 123, unit: 'word', edge: 'focus'});
        expect(kit.editor.cursor.text()).toBe('b cd efg hijklmnopqrstuvwxyz');
        kit.et.cursor({len: -1, unit: 'word', edge: 'focus'});
        expect(kit.editor.cursor.text()).toBe('b cd efg ');
        kit.et.cursor({len: -1, unit: 'word', edge: 'focus'});
        expect(kit.editor.cursor.text()).toBe('b cd ');
        kit.et.cursor({len: -1, unit: 'word', edge: 'focus'});
        expect(kit.editor.cursor.text()).toBe('b ');
        kit.et.cursor({len: -1, unit: 'word', edge: 'focus'});
        expect(kit.editor.cursor.text()).toBe('a');
        kit.et.cursor({len: -1, unit: 'word', edge: 'focus'});
        expect(kit.editor.cursor.text()).toBe('a');
      });
    });

    describe('can move caret', () => {
      test('by one char forwards', () => {
        const kit = setup();
        const view = kit.editor.text();
        kit.et.cursor({at: 0});
        for (let i = 0; i < view.length; i++) {
          expect(kit.editor.cursor.start.leftChar()?.view()).toBe(view[i - 1]);
          kit.et.cursor({len: 1});
          expect(kit.editor.cursor.start.leftChar()?.view()).toBe(view[i]);
        }
      });

      test('by one char backwards', () => {
        const kit = setup();
        const view = kit.editor.text();
        kit.et.cursor({at: 123});
        for (let i = view.length; i >= 0; i--) {
          expect(kit.editor.cursor.start.leftChar()?.view()).toBe(view[i - 1]);
          kit.et.cursor({len: -1});
          expect(kit.editor.cursor.start.leftChar()?.view()).toBe(view[i - 2]);
        }
      });

      test('number of char steps', () => {
        const kit = setup();
        kit.et.cursor({at: 2});
        expect(kit.editor.cursor.start.leftChar()?.view()).toBe('b');
        expect(kit.editor.cursor.isCollapsed()).toBe(true);
        kit.et.cursor({len: 3});
        expect(kit.editor.cursor.start.leftChar()?.view()).toBe('e');
        expect(kit.editor.cursor.isCollapsed()).toBe(true);
        kit.et.cursor({len: 2});
        expect(kit.editor.cursor.start.leftChar()?.view()).toBe('g');
        expect(kit.editor.cursor.isCollapsed()).toBe(true);
        kit.et.cursor({len: -4});
        expect(kit.editor.cursor.start.leftChar()?.view()).toBe('c');
        expect(kit.editor.cursor.isCollapsed()).toBe(true);
        kit.et.cursor({len: -4});
        kit.et.cursor({len: -4});
        kit.et.cursor({len: -4});
        expect(kit.editor.cursor.start.rightChar()?.view()).toBe('a');
        expect(kit.editor.cursor.isCollapsed()).toBe(true);
      });

      test('by skipping words', () => {
        const kit = setup();
        kit.et.cursor({at: 2});
        kit.et.insert(' ');
        kit.et.cursor({at: 5});
        kit.et.insert(' ');
        kit.et.cursor({at: 1});
        expect(kit.editor.cursor.start.viewPos()).toBe(1);
        expect(kit.editor.cursor.isCollapsed()).toBe(true);
        kit.et.cursor({len: 1, unit: 'word'});
        expect(kit.editor.cursor.start.viewPos()).toBe(2);
        expect(kit.editor.cursor.isCollapsed()).toBe(true);
        kit.et.cursor({len: 1, unit: 'word'});
        expect(kit.editor.cursor.start.viewPos()).toBe(5);
        expect(kit.editor.cursor.isCollapsed()).toBe(true);
        kit.et.cursor({len: -1, unit: 'word'});
        expect(kit.editor.cursor.start.viewPos()).toBe(3);
        expect(kit.editor.cursor.isCollapsed()).toBe(true);
        kit.et.cursor({len: -1, unit: 'word'});
        expect(kit.editor.cursor.start.viewPos()).toBe(0);
        expect(kit.editor.cursor.isCollapsed()).toBe(true);
      });
    });

    describe('collapses selection into the direction of movement', () => {
      test('when focus is at end of selection', () => {
        const kit = setup();
        const view = kit.editor.text();
        kit.et.cursor({at: 10, len: 10});
        kit.et.cursor({len: 1});
        expect(kit.editor.cursor.start.viewPos()).toBe(20);
        expect(kit.editor.cursor.isCollapsed()).toBe(true);
        kit.et.cursor({at: 10, len: 10});
        kit.et.cursor({len: -1});
        expect(kit.editor.cursor.start.viewPos()).toBe(10);
        expect(kit.editor.cursor.isCollapsed()).toBe(true);
      });

      test('when focus is at the start of the selection', () => {
        const kit = setup();
        const view = kit.editor.text();
        kit.et.cursor({at: 20, len: -10});
        kit.et.cursor({len: 1});
        expect(kit.editor.cursor.start.viewPos()).toBe(20);
        expect(kit.editor.cursor.isCollapsed()).toBe(true);
        kit.et.cursor({at: 10, len: 10});
        kit.et.cursor({len: -1});
        expect(kit.editor.cursor.start.viewPos()).toBe(10);
        expect(kit.editor.cursor.isCollapsed()).toBe(true);
      });
    });

    describe('can select unit of text at the current caret', () => {
      test('word', () => {
        const kit = setup();
        kit.et.cursor({at: 2});
        kit.et.insert(' ');
        kit.et.cursor({at: 5});
        kit.et.insert(' ');
        kit.et.cursor({at: 4});
        kit.et.cursor({unit: 'word'});
        expect(kit.editor.cursor.text()).toBe('cd');
      });

      test('word - 2', () => {
        const kit = setup();
        kit.et.cursor({at: 2});
        kit.et.insert(' ');
        kit.et.cursor({at: 5});
        kit.et.insert(' ');
        kit.et.cursor({at: 4, unit: 'word'});
        expect(kit.editor.cursor.text()).toBe('cd');
      });

      test('line', () => {
        const kit = setup();
        kit.et.cursor({at: 2});
        kit.et.insert('\n');
        kit.et.cursor({at: 5});
        kit.et.insert('\n');
        kit.et.cursor({at: 4});
        kit.et.cursor({unit: 'line'});
        expect(kit.editor.cursor.text()).toBe('cd');
      });

      test('word - 2', () => {
        const kit = setup();
        kit.et.cursor({at: 2});
        kit.et.insert('\n');
        kit.et.cursor({at: 5});
        kit.et.insert('\n');
        kit.et.cursor({at: 4, unit: 'line'});
        expect(kit.editor.cursor.text()).toBe('cd');
      });
    });
  });
};

describe('"cursor" event', () => {
  runAlphabetKitTestSuite(testSuite);
});
