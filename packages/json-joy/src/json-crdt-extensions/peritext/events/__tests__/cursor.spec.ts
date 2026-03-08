import {CursorAnchor} from '../../../../json-crdt-extensions';
import {type Kit, runAlphabetKitTestSuite} from '../../../../json-crdt-extensions/peritext/__tests__/setup';
import {Anchor} from '../../rga/constants';
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

  describe('clearing all cursors', () => {
    test('can remove a single caret cursor', () => {
      const kit = setup();
      kit.et.cursor({at: [2]});
      expect(kit.editor.cursorCount()).toBe(1);
      kit.et.cursor({clear: true});
      expect(kit.editor.cursorCount()).toBe(0);
    });

    test('can remove multiple cursors', () => {
      const kit = setup();
      kit.et.cursor({at: [2]});
      expect(kit.editor.cursorCount()).toBe(1);
      kit.et.cursor({at: [3, 5], add: true});
      expect(kit.editor.cursorCount()).toBe(2);
      kit.et.cursor({clear: true});
      expect(kit.editor.cursorCount()).toBe(0);
    });
  });

  describe('with absolute position ("at" property set)', () => {
    describe('caret', () => {
      test('can set the caret at the document start', () => {
        const kit = setup();
        kit.et.cursor({at: [0]});
        expect(kit.editor.cursor.start.viewPos()).toBe(0);
        expect(kit.editor.cursor.isCollapsed()).toBe(true);
        expect(kit.editor.cursor.start.rightChar()?.view()).toBe('a');
      });

      test('can set the caret at the document start using Point instance', () => {
        const kit = setup();
        kit.et.cursor({at: [kit.peritext.pointStart()!]});
        expect(kit.editor.cursor.start.viewPos()).toBe(0);
        expect(kit.editor.cursor.isCollapsed()).toBe(true);
        expect(kit.editor.cursor.start.rightChar()?.view()).toBe('a');
      });

      test('can set the caret at the document end', () => {
        const kit = setup();
        kit.et.cursor({at: [kit.editor.text().length]});
        expect(kit.editor.cursor.start.viewPos()).toBe(kit.editor.text().length);
        expect(kit.editor.cursor.isCollapsed()).toBe(true);
        expect(kit.editor.cursor.start.leftChar()?.view()).toBe('z');
      });

      test('can set the caret at the document end using Point instance', () => {
        const kit = setup();
        kit.et.cursor({at: [kit.peritext.pointEnd()!]});
        expect(kit.editor.cursor.start.viewPos()).toBe(kit.editor.text().length);
        expect(kit.editor.cursor.isCollapsed()).toBe(true);
        expect(kit.editor.cursor.start.leftChar()?.view()).toBe('z');
      });

      test('can set the caret in the middle of document', () => {
        const kit = setup();
        const view = kit.editor.text();
        for (let i = 0; i <= view.length; i++) {
          kit.et.cursor({at: [i]});
          expect(kit.editor.cursor.start.viewPos()).toBe(i);
          expect(kit.editor.cursor.start.leftChar()?.view()).toBe(view[i - 1]);
          expect(kit.editor.cursor.start.rightChar()?.view()).toBe(view[i]);
          kit.et.cursor({at: [[i, 0]]});
          expect(kit.editor.cursor.start.viewPos()).toBe(i);
          expect(kit.editor.cursor.start.leftChar()?.view()).toBe(view[i - 1]);
          expect(kit.editor.cursor.start.rightChar()?.view()).toBe(view[i]);
          kit.et.cursor({at: [kit.peritext.pointAt(i)!]});
          expect(kit.editor.cursor.start.viewPos()).toBe(i);
          expect(kit.editor.cursor.start.leftChar()?.view()).toBe(view[i - 1]);
          expect(kit.editor.cursor.start.rightChar()?.view()).toBe(view[i]);
        }
        for (let i = 0; i < view.length; i++) {
          kit.et.cursor({at: [[i, 1]]});
          expect(kit.editor.cursor.start.viewPos()).toBe(i + 1);
          expect(kit.editor.cursor.start.leftChar()?.view()).toBe(view[i]);
          expect(kit.editor.cursor.start.rightChar()?.view()).toBe(view[i + 1]);
        }
      });
    });

    describe('selection', () => {
      test('can set selection at the document start', () => {
        const kit = setup();
        kit.et.cursor({at: [0, 3]});
        expect(kit.editor.cursor.start.viewPos()).toBe(0);
        expect(kit.editor.cursor.isCollapsed()).toBe(false);
        expect(kit.editor.cursor.text()).toBe('abc');
      });

      test('can set selection at the document start using Point instance', () => {
        const kit = setup();
        kit.et.cursor({at: [kit.peritext.pointStart()!, kit.peritext.pointStart()?.copy((p) => p.step(5))]});
        expect(kit.editor.cursor.start.viewPos()).toBe(0);
        expect(kit.editor.cursor.isCollapsed()).toBe(false);
        expect(kit.editor.cursor.text()).toBe('abcde');
      });

      test('can set selection at the end of document', () => {
        const kit = setup();
        kit.et.cursor({at: [5, 128]});
        expect(kit.editor.cursor.text()).toBe(kit.editor.text().slice(5));
        expect(kit.editor.cursor.length()).toBe(kit.editor.text().length - 5);
        expect(kit.editor.cursor.isCollapsed()).toBe(false);
      });

      test('can set selection at the document end using Point instance', () => {
        const kit = setup();
        kit.et.cursor({at: [kit.peritext.pointAt(5), 128]});
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
            kit.et.cursor({at: [i, i + length]});
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
            kit.et.cursor({at: [i, i - length]});
            expect(kit.editor.cursor.text()).toBe(view.slice(i - length, i));
          }
        }
      });

      test('anchor and focus depends on the sign of the length', () => {
        const kit = setup();
        kit.et.cursor({at: [15, 15 + 3]});
        expect(kit.editor.cursor.text()).toBe('pqr');
        expect(kit.editor.cursor.isEndFocused()).toBe(true);
        kit.et.cursor({at: [15, 15 - 3]});
        expect(kit.editor.cursor.text()).toBe('mno');
        expect(kit.editor.cursor.isStartFocused()).toBe(true);
        expect(kit.editor.cursor.anchorSide).toBe(CursorAnchor.End);
      });

      test('range selection can use "unit" prop to specify step size', () => {
        const kit = setup();
        kit.et.cursor({at: [4]});
        kit.et.insert(' ');
        kit.et.cursor({at: [9]});
        kit.et.insert(' ');
        kit.et.cursor({at: [2]});
        kit.et.cursor({at: [2], move: [['end', 'word', 2]]});
        expect(kit.editor.cursor.text()).toBe('cd efgh');
      });

      test('can move specific edge of selection', () => {
        const kit = setup();
        kit.et.cursor({at: [12, 12 + 5]});
        expect(kit.editor.cursor.text()).toBe('mnopq');
        kit.et.cursor({move: [['focus', 14]]});
        expect(kit.editor.cursor.text()).toBe('mn');
        kit.et.cursor({move: [['anchor', 10]]});
        expect(kit.editor.cursor.text()).toBe('klmn');
        kit.et.cursor({move: [['anchor', 16]]});
        expect(kit.editor.cursor.text()).toBe('op');
        kit.et.cursor({move: [['focus', 0]]});
        expect(kit.editor.cursor.text()).toBe('abcdefghijklmnop');
      });

      test('when specific cursor edge is moved caret is expanded to a range', () => {
        const kit = setup();
        kit.et.cursor({at: [5]});
        expect(kit.editor.cursor.text()).toBe('');
        kit.et.cursor({move: [['focus', 7]]});
        expect(kit.editor.cursor.text()).toBe('fg');
      });
    });

    describe('adding multiple cursors { add: true }', () => {
      test('can insert new carets into the document', () => {
        const kit = setup();
        kit.editor.delCursors();
        expect(kit.editor.cursorCount()).toBe(0);
        kit.et.cursor({at: [5], add: true});
        expect(kit.editor.cursorCount()).toBe(1);
        kit.et.cursor({at: [12], add: true});
        expect(kit.editor.cursorCount()).toBe(2);
        kit.et.cursor({at: [21], add: true});
        expect(kit.editor.cursorCount()).toBe(3);
        kit.et.insert('_');
        expect(kit.editor.text()).toBe('abcde_fghijkl_mnopqrstu_vwxyz');
      });

      test('leaves only one cursor when caret is set', () => {
        const kit = setup();
        kit.editor.delCursors();
        expect(kit.editor.cursorCount()).toBe(0);
        kit.et.cursor({at: [5], add: true});
        expect(kit.editor.cursorCount()).toBe(1);
        kit.et.cursor({at: [12], add: true});
        expect(kit.editor.cursorCount()).toBe(2);
        kit.et.cursor({at: [10]});
        expect(kit.editor.cursorCount()).toBe(1);
        expect(kit.editor.cursor.start.viewPos()).toBe(10);
      });
    });
  });

  describe('with relative position ("at" property not set)', () => {
    describe('can move a specific edge', () => {
      test('can move focus relative amount of chars', () => {
        const kit = setup();
        kit.et.cursor({at: [2, 2 + 2]});
        expect(kit.editor.cursor.text()).toBe('cd');
        kit.et.cursor({move: [['focus', 'char', 3]]});
        expect(kit.editor.cursor.text()).toBe('cdefg');
        kit.et.cursor({move: [['focus', 'char', -6]]});
        expect(kit.editor.cursor.text()).toBe('b');
        kit.et.cursor({move: [['focus', 'char', -1]]});
        expect(kit.editor.cursor.text()).toBe('ab');
        kit.et.cursor({move: [['focus', 'char', -1]]});
        expect(kit.editor.cursor.text()).toBe('ab');
        kit.et.cursor({move: [['focus', 'char', -1]]});
        expect(kit.editor.cursor.text()).toBe('ab');
      });

      test('can move anchor relative amount of chars', () => {
        const kit = setup();
        kit.et.cursor({at: [2, 2 + 2]});
        expect(kit.editor.cursor.text()).toBe('cd');
        kit.et.cursor({move: [['anchor', 'char', -5]]});
        expect(kit.editor.cursor.text()).toBe('abcd');
        kit.et.cursor({move: [['anchor', 'char', 1]]});
        expect(kit.editor.cursor.text()).toBe('bcd');
        kit.et.cursor({move: [['anchor', 'char', 1]]});
        expect(kit.editor.cursor.text()).toBe('cd');
        kit.et.cursor({move: [['anchor', 'char', 1]]});
        expect(kit.editor.cursor.text()).toBe('d');
        kit.et.cursor({move: [['anchor', 'char', 1]]});
        expect(kit.editor.cursor.text()).toBe('');
        kit.et.cursor({move: [['anchor', 'char', 1]]});
        expect(kit.editor.cursor.text()).toBe('e');
        kit.et.cursor({move: [['anchor', 'char', 1]]});
        expect(kit.editor.cursor.text()).toBe('ef');
        kit.et.cursor({move: [['anchor', 'char', 1]]});
        expect(kit.editor.cursor.text()).toBe('efg');
        kit.et.cursor({move: [['anchor', 'char', 123]]});
        expect(kit.editor.cursor.text()).toBe('efghijklmnopqrstuvwxyz');
      });

      test('can move "focus" edge in word units', () => {
        const kit = setup();
        kit.et.cursor({at: [2]});
        kit.et.insert(' ');
        kit.et.cursor({at: [5]});
        kit.et.insert(' ');
        kit.et.cursor({at: [9]});
        kit.et.insert(' ');
        kit.et.cursor({at: [1]});
        expect(kit.editor.cursor.text()).toBe('');
        kit.et.cursor({move: [['focus', 'word', 1]]});
        expect(kit.editor.cursor.text()).toBe('b');
        expect(kit.editor.cursor.isEndFocused()).toBe(true);
        kit.et.cursor({move: [['focus', 'word', 1]]});
        expect(kit.editor.cursor.text()).toBe('b cd');
        kit.et.cursor({move: [['focus', 'word', 1]]});
        expect(kit.editor.cursor.text()).toBe('b cd efg');
        kit.et.cursor({move: [['focus', 'word', 123]]});
        expect(kit.editor.cursor.text()).toBe('b cd efg hijklmnopqrstuvwxyz');
        kit.et.cursor({move: [['focus', 'word', -1]]});
        expect(kit.editor.cursor.text()).toBe('b cd efg ');
        kit.et.cursor({move: [['focus', 'word', -1]]});
        expect(kit.editor.cursor.text()).toBe('b cd ');
        kit.et.cursor({move: [['focus', 'word', -1]]});
        expect(kit.editor.cursor.text()).toBe('b ');
        kit.et.cursor({move: [['focus', 'word', -1]]});
        expect(kit.editor.cursor.text()).toBe('a');
        kit.et.cursor({move: [['focus', 'word', -1]]});
        expect(kit.editor.cursor.text()).toBe('a');
      });
    });

    describe('can move caret', () => {
      test('by one char forwards', () => {
        const kit = setup();
        const view = kit.editor.text();
        for (const edge of ['start', 'end', 'focus', 'anchor'] as const) {
          kit.et.cursor({at: [0]});
          for (let i = 0; i < view.length; i++) {
            expect(kit.editor.cursor.start.leftChar()?.view()).toBe(view[i - 1]);
            kit.et.cursor({move: [[edge, 'char', 1, true]]});
            expect(kit.editor.cursor.start.leftChar()?.view()).toBe(view[i]);
          }
        }
      });

      test('by one char backwards', () => {
        const kit = setup();
        const view = kit.editor.text();
        for (const edge of ['start', 'end', 'focus', 'anchor'] as const) {
          kit.et.cursor({at: [123]});
          for (let i = view.length; i >= 0; i--) {
            expect(kit.editor.cursor.start.leftChar()?.view()).toBe(view[i - 1]);
            kit.et.cursor({move: [[edge, 'char', -1, true]]});
            expect(kit.editor.cursor.start.leftChar()?.view()).toBe(view[i - 2]);
          }
        }
      });

      test('number of char steps', () => {
        const kit = setup();
        kit.et.cursor({at: [2]});
        expect(kit.editor.cursor.start.leftChar()?.view()).toBe('b');
        expect(kit.editor.cursor.isCollapsed()).toBe(true);
        kit.et.cursor({move: [['end', 'char', 3, true]]});
        expect(kit.editor.cursor.start.leftChar()?.view()).toBe('e');
        expect(kit.editor.cursor.isCollapsed()).toBe(true);
        kit.et.cursor({move: [['end', 'char', 2, true]]});
        expect(kit.editor.cursor.start.leftChar()?.view()).toBe('g');
        expect(kit.editor.cursor.isCollapsed()).toBe(true);
        kit.et.cursor({move: [['end', 'char', -4, true]]});
        expect(kit.editor.cursor.start.leftChar()?.view()).toBe('c');
        expect(kit.editor.cursor.isCollapsed()).toBe(true);
        kit.et.cursor({move: [['end', 'char', -4, true]]});
        kit.et.cursor({move: [['end', 'char', -4, true]]});
        kit.et.cursor({move: [['end', 'char', -4, true]]});
        expect(kit.editor.cursor.start.rightChar()?.view()).toBe('a');
        expect(kit.editor.cursor.isCollapsed()).toBe(true);
      });

      test('by skipping words', () => {
        const kit = setup();
        kit.et.cursor({at: [2]});
        kit.et.insert(' ');
        kit.et.cursor({at: [5]});
        kit.et.insert(' ');
        kit.et.cursor({at: [1]});
        expect(kit.editor.cursor.start.viewPos()).toBe(1);
        expect(kit.editor.cursor.isCollapsed()).toBe(true);
        kit.et.cursor({move: [['end', 'word', 1, true]]});
        expect(kit.editor.cursor.start.viewPos()).toBe(2);
        expect(kit.editor.cursor.isCollapsed()).toBe(true);
        kit.et.cursor({move: [['end', 'word', 1, true]]});
        expect(kit.editor.cursor.start.viewPos()).toBe(5);
        expect(kit.editor.cursor.isCollapsed()).toBe(true);
        kit.et.cursor({move: [['end', 'word', -1, true]]});
        expect(kit.editor.cursor.start.viewPos()).toBe(3);
        expect(kit.editor.cursor.isCollapsed()).toBe(true);
        kit.et.cursor({move: [['end', 'word', -1, true]]});
        expect(kit.editor.cursor.start.viewPos()).toBe(0);
        expect(kit.editor.cursor.isCollapsed()).toBe(true);
      });
    });

    describe('collapses selection into the direction of movement', () => {
      test('when focus is at end of selection', () => {
        const kit = setup();
        const _view = kit.editor.text();
        kit.et.cursor({at: [10, 10 + 10]});
        kit.et.cursor({move: [['focus', 'char', 0, true]]});
        expect(kit.editor.cursor.start.viewPos()).toBe(20);
        expect(kit.editor.cursor.isCollapsed()).toBe(true);
        kit.et.cursor({at: [10, 10 + 10]});
        kit.et.cursor({move: [['anchor', 'char', 0, true]]});
        expect(kit.editor.cursor.start.viewPos()).toBe(10);
        expect(kit.editor.cursor.isCollapsed()).toBe(true);
      });

      test('when focus is at the start of the selection', () => {
        const kit = setup();
        const _view = kit.editor.text();
        kit.et.cursor({at: [20, 20 - 10]});
        kit.et.cursor({move: [['end', 'char', 0, true]]});
        expect(kit.editor.cursor.start.viewPos()).toBe(20);
        expect(kit.editor.cursor.isCollapsed()).toBe(true);
        kit.et.cursor({at: [10, 10 + 10]});
        kit.et.cursor({move: [['start', 'char', 0, true]]});
        expect(kit.editor.cursor.start.viewPos()).toBe(10);
        expect(kit.editor.cursor.isCollapsed()).toBe(true);
      });
    });

    describe('can select unit of text at the current caret', () => {
      test('word', () => {
        const kit = setup();
        kit.et.cursor({at: [2]});
        kit.et.insert(' ');
        kit.et.cursor({at: [5]});
        kit.et.insert(' ');
        kit.et.cursor({at: [4]});
        kit.et.cursor({
          move: [
            ['start', 'word', -1],
            ['end', 'word', 1],
          ],
        });
        expect(kit.editor.cursor.text()).toBe('cd');
      });

      test('word - 2', () => {
        const kit = setup();
        kit.et.cursor({at: [2]});
        kit.et.insert(' ');
        kit.et.cursor({at: [5]});
        kit.et.insert(' ');
        kit.et.cursor({
          at: [4],
          move: [
            ['start', 'word', -1],
            ['end', 'word', 1],
          ],
        });
        expect(kit.editor.cursor.text()).toBe('cd');
      });

      test('line', () => {
        const kit = setup();
        kit.et.cursor({at: [2]});
        kit.et.insert('\n');
        kit.et.cursor({at: [5]});
        kit.et.insert('\n');
        kit.et.cursor({at: [4]});
        kit.et.cursor({
          move: [
            ['start', 'line', -1],
            ['end', 'line', 1],
          ],
        });
        expect(kit.editor.cursor.text()).toBe('cd');
      });

      test('word - 2', () => {
        const kit = setup();
        kit.et.cursor({at: [2]});
        kit.et.insert('\n');
        kit.et.cursor({at: [5]});
        kit.et.insert('\n');
        kit.et.cursor({
          at: [4],
          move: [
            ['start', 'line', -1],
            ['end', 'line', 1],
          ],
        });
        expect(kit.editor.cursor.text()).toBe('cd');
      });
    });
  });

  describe('"vchar" unit moves', () => {
    test('can move over (bounded, un-bounded) inline formatting edges left-to-right', () => {
      //       4   4.1    8   8.1
      //       |   |      |   |
      // "abcd".   ."efgh".   ."ijklmnopqrstuvwxyz"
      //           |          |
      //           | - bold - |
      //           |          |
      //           bound      |
      //                      un-bound

      const kit = setup();
      kit.et.cursor({at: [4, 8]});
      kit.peritext.refresh();
      kit.et.format('ins', 'bold');
      kit.peritext.refresh();
      kit.et.cursor({at: [2]});
      kit.peritext.refresh();
      expect(kit.editor.cursor.start.leftChar()?.view()).toBe('b');
      kit.et.cursor({move: [['focus', 'vchar', 1, true]]});
      kit.peritext.refresh();
      expect(kit.editor.cursor.start.leftChar()?.view()).toBe('c');
      expect(kit.editor.cursor.start.viewPos()).toBe(3);

      // Bold formatting begins at position 4, after character 'd', so in the
      // gap between 'd' and 'e' we spend two "vchar" steps - one to move the
      // cursor into the formatting, and one to move it over 'e'.

      // Before formatting, attachment = "d".:
      kit.et.cursor({move: [['focus', 'vchar', 1, true]]});
      kit.peritext.refresh();
      expect(kit.editor.cursor.start.leftChar()?.view()).toBe('d');
      expect(kit.editor.cursor.start.viewPos()).toBe(4);
      expect(kit.editor.cursor.start.anchor).toBe(Anchor.After);

      // Inside the formatting (but before 'e'), attachment = ."e":
      kit.et.cursor({move: [['focus', 'vchar', 1, true]]});
      kit.peritext.refresh();
      expect(kit.editor.cursor.start.leftChar()?.view()).toBe('d');
      expect(kit.editor.cursor.start.viewPos()).toBe(4);
      expect(kit.editor.cursor.start.anchor).toBe(Anchor.Before);

      // Past formatting, attachment = "e".:
      kit.et.cursor({move: [['focus', 'vchar', 1, true]]});
      kit.peritext.refresh();
      expect(kit.editor.cursor.start.leftChar()?.view()).toBe('e');
      expect(kit.editor.cursor.start.viewPos()).toBe(5);
      expect(kit.editor.cursor.start.anchor).toBe(Anchor.After);

      kit.et.cursor({move: [['focus', 'vchar', 2, true]]});
      kit.peritext.refresh();

      // Before formatting end, attachment = "h".:
      kit.et.cursor({move: [['focus', 'vchar', 1, true]]});
      kit.peritext.refresh();
      expect(kit.editor.cursor.start.leftChar()?.view()).toBe('h');
      expect(kit.editor.cursor.start.viewPos()).toBe(8);
      expect(kit.editor.cursor.start.anchor).toBe(Anchor.After);

      // After formatting end, attachment = ."i":
      kit.et.cursor({move: [['focus', 'vchar', 1, true]]});
      kit.peritext.refresh();
      expect(kit.editor.cursor.start.leftChar()?.view()).toBe('h');
      expect(kit.editor.cursor.start.viewPos()).toBe(8);
      expect(kit.editor.cursor.start.anchor).toBe(Anchor.Before);

      kit.et.cursor({move: [['focus', 'vchar', 1, true]]});
      kit.peritext.refresh();
      expect(kit.editor.cursor.start.leftChar()?.view()).toBe('i');
      expect(kit.editor.cursor.start.viewPos()).toBe(9);
      expect(kit.editor.cursor.start.anchor).toBe(Anchor.After);
    });

    test('can move over (bounded, un-bounded) inline formatting edges left-to-right with tombstones', () => {
      //                4
      //     2      2.1 |        4.1
      //     |      |   |        |
      // "ab".   .⛼ ."d".     .⛼ ."fghijklmnopqrstuvwxyz"
      //         |            |
      //         |  - bold -  |
      //         |            |
      //         bound        |
      //                      un-bound

      const kit = setup();
      kit.et.cursor({at: [2, 4]});
      kit.peritext.refresh();
      kit.et.format('ins', 'bold');
      kit.peritext.refresh();
      kit.et.cursor({at: [2, 3]});
      kit.peritext.refresh();
      kit.editor.delRange(kit.editor.cursor);
      kit.peritext.refresh();
      kit.et.cursor({at: [3, 4]});
      kit.peritext.refresh();
      kit.editor.delRange(kit.editor.cursor);
      kit.editor.delCursors();
      kit.peritext.refresh();
      kit.et.cursor({at: [1]});
      expect(kit.editor.cursor.start.leftChar()?.view()).toBe('a');

      // Before formatting, attachment = "b".:
      kit.et.cursor({move: [['focus', 'vchar', 1, true]]});
      kit.peritext.refresh();
      expect(kit.editor.cursor.start.leftChar()?.view()).toBe('b');
      expect(kit.editor.cursor.start.anchor).toBe(Anchor.After);

      // Inside the formatting (but before 'd'), attachment = ."d":
      kit.et.cursor({move: [['focus', 'vchar', 1, true]]});
      kit.peritext.refresh();
      expect(kit.editor.cursor.start.leftChar()?.view()).toBe('b');
      expect(kit.editor.cursor.start.anchor).toBe(Anchor.Before);

      // Before formatting end, attachment = "d".:
      kit.et.cursor({move: [['focus', 'vchar', 1, true]]});
      kit.peritext.refresh();
      expect(kit.editor.cursor.start.leftChar()?.view()).toBe('d');
      expect(kit.editor.cursor.start.anchor).toBe(Anchor.After);

      // After formatting end, attachment = ."f":
      kit.et.cursor({move: [['focus', 'vchar', 1, true]]});
      kit.peritext.refresh();
      expect(kit.editor.cursor.start.leftChar()?.view()).toBe('d');
      expect(kit.editor.cursor.start.anchor).toBe(Anchor.Before);
    });

    test('can move over (bounded, un-bounded) inline formatting edges right-to-left', () => {
      //        5   5.1     10  10.1
      //        |   |       |   |
      // "abcde".   ."fghij".   ."klmnopqrstuvwxyz"
      //            |           |
      //            |           |
      //            bound       |
      //                        un-bound

      const kit = setup();
      kit.et.cursor({at: [5, 10]});
      kit.peritext.refresh();
      kit.et.format('ins', 'bold');
      kit.peritext.refresh();
      kit.et.cursor({at: [11]});
      kit.peritext.refresh();
      expect(kit.editor.cursor.start.leftChar()?.view()).toBe('k');
      expect(kit.editor.cursor.start.viewPos()).toBe(11);

      // Before formatting, attachment = ."k":
      kit.et.cursor({move: [['focus', 'vchar', -1, true]]});
      kit.peritext.refresh();
      expect(kit.editor.cursor.start.leftChar()?.view()).toBe('j');
      expect(kit.editor.cursor.start.anchor).toBe(Anchor.Before);

      // Inside the formatting, attachment = "j".:
      kit.et.cursor({move: [['focus', 'vchar', -1, true]]});
      kit.peritext.refresh();
      expect(kit.editor.cursor.start.leftChar()?.view()).toBe('j');
      expect(kit.editor.cursor.start.anchor).toBe(Anchor.After);

      // Past formatting, attachment = "i".:
      kit.et.cursor({move: [['focus', 'vchar', -1, true]]});
      kit.peritext.refresh();
      expect(kit.editor.cursor.start.leftChar()?.view()).toBe('i');
      expect(kit.editor.cursor.start.anchor).toBe(Anchor.After);

      kit.et.cursor({move: [['focus', 'vchar', -3, true]]});
      kit.peritext.refresh();

      // Inside formatting, attachment = ."f":
      kit.et.cursor({move: [['focus', 'vchar', -1, true]]});
      kit.peritext.refresh();
      expect(kit.editor.cursor.start.leftChar()?.view()).toBe('e');
      expect(kit.editor.cursor.start.anchor).toBe(Anchor.Before);

      // Before formatting, attachment = "e".:
      kit.et.cursor({move: [['focus', 'vchar', -1, true]]});
      kit.peritext.refresh();
      expect(kit.editor.cursor.start.leftChar()?.view()).toBe('e');
      expect(kit.editor.cursor.start.anchor).toBe(Anchor.After);

      kit.et.cursor({move: [['focus', 'vchar', -1, true]]});
      kit.peritext.refresh();
      expect(kit.editor.cursor.start.leftChar()?.view()).toBe('d');
      kit.et.cursor({move: [['focus', 'vchar', -1, true]]});
      kit.peritext.refresh();
      expect(kit.editor.cursor.start.leftChar()?.view()).toBe('c');
      kit.et.cursor({move: [['focus', 'vchar', -1, true]]});
      kit.peritext.refresh();
      expect(kit.editor.cursor.start.leftChar()?.view()).toBe('b');
      kit.et.cursor({move: [['focus', 'vchar', -1, true]]});
      kit.peritext.refresh();
      expect(kit.editor.cursor.start.leftChar()?.view()).toBe('a');
      kit.et.cursor({move: [['focus', 'vchar', -1, true]]});
      kit.peritext.refresh();
      expect(kit.editor.cursor.start.leftChar()?.view() || '').toBe('');
    });

    test('can move over (un-bounded, bounded) inline formatting edges left-to-right', () => {
      //      3    3.1   6    6.1
      //      |    |     |    |
      // "abc".    ."def".    ."ghijklmnopqrstuvwxyz"
      //      |          |
      //      | - bold - |
      //      |          |
      //      un-bound   |
      //                 bound

      const kit = setup();
      const range = kit.peritext.range(kit.peritext.pointAt(2, Anchor.After)!, kit.peritext.pointAt(5, Anchor.After)!);
      kit.peritext.savedSlices.insOne(range, 'bold');
      kit.peritext.refresh();
      kit.et.cursor({at: [1]});
      kit.peritext.refresh();

      expect(kit.editor.cursor.start.leftChar()?.view()).toBe('a');
      kit.et.cursor({move: [['focus', 'vchar', 1, true]]});
      kit.peritext.refresh();
      expect(kit.editor.cursor.start.leftChar()?.view()).toBe('b');
      expect(kit.editor.cursor.start.anchor).toBe(Anchor.After);

      // Before formatting, attachment = "c".:
      kit.et.cursor({move: [['focus', 'vchar', 1, true]]});
      kit.peritext.refresh();
      expect(kit.editor.cursor.start.leftChar()?.view()).toBe('c');
      expect(kit.editor.cursor.start.viewPos()).toBe(3);
      expect(kit.editor.cursor.start.anchor).toBe(Anchor.After);

      // Inside formatting, attachment = ."d":
      kit.et.cursor({move: [['focus', 'vchar', 1, true]]});
      kit.peritext.refresh();
      expect(kit.editor.cursor.start.leftChar()?.view()).toBe('c');
      expect(kit.editor.cursor.start.viewPos()).toBe(3);
      expect(kit.editor.cursor.start.anchor).toBe(Anchor.Before);

      // Step over 'd', inside bold:
      kit.et.cursor({move: [['focus', 'vchar', 1, true]]});
      kit.peritext.refresh();
      expect(kit.editor.cursor.start.leftChar()?.view()).toBe('d');
      expect(kit.editor.cursor.start.viewPos()).toBe(4);

      // Step over 'e', inside bold:
      kit.et.cursor({move: [['focus', 'vchar', 1, true]]});
      kit.peritext.refresh();
      expect(kit.editor.cursor.start.leftChar()?.view()).toBe('e');
      expect(kit.editor.cursor.start.viewPos()).toBe(5);

      // Step to the bounded end edge, attachment = "f".:
      kit.et.cursor({move: [['focus', 'vchar', 1, true]]});
      kit.peritext.refresh();
      expect(kit.editor.cursor.start.leftChar()?.view()).toBe('f');
      expect(kit.editor.cursor.start.viewPos()).toBe(6);
      expect(kit.editor.cursor.start.anchor).toBe(Anchor.After);

      // Step outside of formatting, attachment = ."g":
      kit.et.cursor({move: [['focus', 'vchar', 1, true]]});
      kit.peritext.refresh();
      expect(kit.editor.cursor.start.leftChar()?.view()).toBe('f');
      expect(kit.editor.cursor.start.viewPos()).toBe(6);
      expect(kit.editor.cursor.start.anchor).toBe(Anchor.Before);

      // Past bold, normal stepping:
      for (let i = 0; i < 10; i++) {
        kit.et.cursor({move: [['focus', 'vchar', 1, true]]});
        kit.peritext.refresh();
        expect(kit.editor.cursor.start.viewPos()).toBe(i + 7);
      }
    });

    test('can move over (un-bounded, bounded) inline formatting edges left-to-right with tombstones', () => {
      //                2
      //    1       1.1 |        2.1
      //    |       |   |        |
      // "a". ⛼.    ."c". ⛼.     ."efghijklmnopqrstuvwxyz"
      //       |            |
      //       |<-  bold  ->|
      //       |            |
      //       un-bound     |
      //                    bound

      const kit = setup();
      kit.editor.addCursor(
        kit.peritext.range(kit.peritext.pointAt(1, Anchor.After)!, kit.peritext.pointAt(3, Anchor.After)!),
      );
      kit.peritext.refresh();
      kit.et.format('ins', 'bold');
      kit.peritext.refresh();
      kit.et.cursor({at: [1, 2]});
      kit.peritext.refresh();
      kit.editor.delRange(kit.editor.cursor);
      kit.peritext.refresh();
      kit.et.cursor({at: [2, 3]});
      kit.peritext.refresh();
      kit.editor.delRange(kit.editor.cursor);
      kit.editor.delCursors();
      kit.peritext.refresh();
      kit.et.cursor({at: [0]});
      expect(kit.editor.cursor.start.leftChar()?.view() || '').toBe('');

      // Before formatting, attachment = "a".:
      kit.et.cursor({move: [['focus', 'vchar', 1, true]]});
      kit.peritext.refresh();
      expect(kit.editor.cursor.start.leftChar()?.view()).toBe('a');
      expect(kit.editor.cursor.start.anchor).toBe(Anchor.After);

      // Inside the formatting (but before 'c'), attachment = ."c":
      kit.et.cursor({move: [['focus', 'vchar', 1, true]]});
      kit.peritext.refresh();
      expect(kit.editor.cursor.start.leftChar()?.view()).toBe('a');
      expect(kit.editor.cursor.start.anchor).toBe(Anchor.Before);

      // Before formatting end, attachment = "c".:
      kit.et.cursor({move: [['focus', 'vchar', 1, true]]});
      kit.peritext.refresh();
      expect(kit.editor.cursor.start.leftChar()?.view()).toBe('c');
      expect(kit.editor.cursor.start.anchor).toBe(Anchor.After);

      // After formatting end, attachment = ."e":
      kit.et.cursor({move: [['focus', 'vchar', 1, true]]});
      kit.peritext.refresh();
      expect(kit.editor.cursor.start.leftChar()?.view()).toBe('c');
      expect(kit.editor.cursor.start.anchor).toBe(Anchor.Before);
    });

    test('can move over (un-bounded, bounded) inline formatting edges right-to-left', () => {
      //      3    3.1   6    6.1
      //      |    |     |    |
      // "abc".    ."def".    ."ghijklmnopqrstuvwxyz"
      //      |          |
      //      |<- bold ->|
      //      |          |
      //      un-bound   |
      //                 bound

      const kit = setup();
      const range = kit.peritext.range(kit.peritext.pointAt(2, Anchor.After)!, kit.peritext.pointAt(5, Anchor.After)!);
      kit.peritext.savedSlices.insOne(range, 'bold');
      kit.peritext.refresh();
      kit.et.cursor({at: [8]});
      kit.peritext.refresh();
      expect(kit.editor.cursor.start.leftChar()?.view()).toBe('h');
      expect(kit.editor.cursor.start.viewPos()).toBe(8);

      kit.et.cursor({move: [['focus', 'vchar', -1, true]]});
      kit.peritext.refresh();
      expect(kit.editor.cursor.start.leftChar()?.view()).toBe('g');

      // Before formatting, attachment = ."g":
      kit.et.cursor({move: [['focus', 'vchar', -1, true]]});
      kit.peritext.refresh();
      expect(kit.editor.cursor.start.leftChar()?.view()).toBe('f');
      expect(kit.editor.cursor.start.anchor).toBe(Anchor.Before);

      // Entering formatting, attachment = "f".:
      kit.et.cursor({move: [['focus', 'vchar', -1, true]]});
      kit.peritext.refresh();
      expect(kit.editor.cursor.start.leftChar()?.view()).toBe('f');
      expect(kit.editor.cursor.start.anchor).toBe(Anchor.After);

      // Move inside bold
      kit.et.cursor({move: [['focus', 'vchar', -1, true]]});
      kit.peritext.refresh();
      expect(kit.editor.cursor.start.leftChar()?.view()).toBe('e');
      kit.et.cursor({move: [['focus', 'vchar', -1, true]]});
      kit.peritext.refresh();
      expect(kit.editor.cursor.start.leftChar()?.view()).toBe('d');

      // Step to un-bounded start edge, attachment = ."d":
      kit.et.cursor({move: [['focus', 'vchar', -1, true]]});
      kit.peritext.refresh();
      expect(kit.editor.cursor.start.leftChar()?.view()).toBe('c');
      expect(kit.editor.cursor.start.anchor).toBe(Anchor.Before);

      // Move outside of formatting, attachment = "c".:
      kit.et.cursor({move: [['focus', 'vchar', -1, true]]});
      kit.peritext.refresh();
      expect(kit.editor.cursor.start.leftChar()?.view()).toBe('c');
      expect(kit.editor.cursor.start.anchor).toBe(Anchor.After);

      // Past bold, normal steps:
      kit.et.cursor({move: [['focus', 'vchar', -1, true]]});
      kit.peritext.refresh();
      expect(kit.editor.cursor.start.leftChar()?.view()).toBe('b');
      kit.et.cursor({move: [['focus', 'vchar', -1, true]]});
      kit.peritext.refresh();
      expect(kit.editor.cursor.start.leftChar()?.view()).toBe('a');
      kit.et.cursor({move: [['focus', 'vchar', -1, true]]});
      kit.peritext.refresh();
      expect(kit.editor.cursor.start.leftChar()?.view() || '').toBe('');
    });
  });
};

describe('"cursor" event', () => {
  runAlphabetKitTestSuite(testSuite);
});
