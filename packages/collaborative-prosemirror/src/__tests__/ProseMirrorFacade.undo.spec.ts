/** @jest-environment jsdom */

import {Node} from 'prosemirror-model';
import {doc, p} from 'prosemirror-test-builder';
import {undo, redo, undoDepth, redoDepth} from 'prosemirror-history';
import {setup} from './setup';
import {SYNC_PLUGIN_KEY, TransactionOrigin} from '../constants';
import type {SyncPluginTransactionMeta} from '../sync/types';

const typeAt = (view: ReturnType<typeof setup>['view'], pos: number, text: string) => {
  const {state} = view;
  const tr = state.tr.insertText(text, pos);
  view.dispatch(tr);
};

const deleteRange = (view: ReturnType<typeof setup>['view'], from: number, to: number) => {
  const {state} = view;
  const tr = state.tr.delete(from, to);
  view.dispatch(tr);
};

/**
 * Simulate a remote text insertion at the ProseMirror level. The transaction is
 * tagged with `TransactionOrigin.REMOTE` and `addToHistory: false`, exactly as
 * `ProseMirrorFacade.set()` does when syncing changes from the CRDT model.
 *
 * Note: this only modifies the PM document — the CRDT model is NOT updated, so
 * the two will diverge. This is intentional: the tests in this file focus on
 * the *history plugin behaviour*, not CRDT sync correctness.
 */
const remoteInsert = (view: ReturnType<typeof setup>['view'], pos: number, text: string) => {
  const {state} = view;
  const tr = state.tr.insertText(text, pos);
  const meta: SyncPluginTransactionMeta = {orig: TransactionOrigin.REMOTE};
  tr.setMeta(SYNC_PLUGIN_KEY, meta);
  tr.setMeta('addToHistory', false);
  view.dispatch(tr);
};

const remoteDelete = (view: ReturnType<typeof setup>['view'], from: number, to: number) => {
  const {state} = view;
  const tr = state.tr.delete(from, to);
  const meta: SyncPluginTransactionMeta = {orig: TransactionOrigin.REMOTE};
  tr.setMeta(SYNC_PLUGIN_KEY, meta);
  tr.setMeta('addToHistory', false);
  view.dispatch(tr);
};

const execUndo = (view: ReturnType<typeof setup>['view']): boolean => undo(view.state, view.dispatch);

const execRedo = (view: ReturnType<typeof setup>['view']): boolean => redo(view.state, view.dispatch);

describe('ProseMirrorFacade — undo/redo history', () => {
  describe('local transactions are part of undo/redo history', () => {
    test('typing a character creates an undo entry', () => {
      const pmDoc = doc(p('hello')) as Node;
      using testbed = setup(pmDoc);
      const {view} = testbed;

      expect(undoDepth(view.state)).toBe(0);
      typeAt(view, 6, '!');
      expect(view.state.doc.textContent).toBe('hello!');
      expect(undoDepth(view.state)).toBeGreaterThan(0);
    });

    test('undo reverts a typed character', () => {
      const pmDoc = doc(p('hello')) as Node;
      using testbed = setup(pmDoc);
      const {view} = testbed;

      typeAt(view, 6, '!');
      expect(view.state.doc.textContent).toBe('hello!');

      const undone = execUndo(view);
      expect(undone).toBe(true);
      expect(view.state.doc.textContent).toBe('hello');
    });

    test('redo restores an undone character', () => {
      const pmDoc = doc(p('hello')) as Node;
      using testbed = setup(pmDoc);
      const {view} = testbed;

      typeAt(view, 6, '!');
      execUndo(view);
      expect(view.state.doc.textContent).toBe('hello');

      const redone = execRedo(view);
      expect(redone).toBe(true);
      expect(view.state.doc.textContent).toBe('hello!');
    });

    test('undo reverts a deletion', () => {
      const pmDoc = doc(p('hello')) as Node;
      using testbed = setup(pmDoc);
      const {view} = testbed;

      // Delete 'h' at pos 1..2
      deleteRange(view, 1, 2);
      expect(view.state.doc.textContent).toBe('ello');

      execUndo(view);
      expect(view.state.doc.textContent).toBe('hello');
    });

    test('multiple undos revert multiple edits', () => {
      const pmDoc = doc(p('ab')) as Node;
      using testbed = setup(pmDoc);
      const {view} = testbed;

      typeAt(view, 2, 'X');
      expect(view.state.doc.textContent).toBe('aXb');

      typeAt(view, 4, 'Y');
      expect(view.state.doc.textContent).toBe('aXbY');

      // Undo Y
      execUndo(view);
      expect(view.state.doc.textContent).toBe('aXb');

      // Undo X
      execUndo(view);
      expect(view.state.doc.textContent).toBe('ab');
    });

    test('undo returns false when there is nothing to undo', () => {
      const pmDoc = doc(p('hello')) as Node;
      using testbed = setup(pmDoc);
      const {view} = testbed;

      expect(execUndo(view)).toBe(false);
      expect(undoDepth(view.state)).toBe(0);
    });

    test('redo returns false when there is nothing to redo', () => {
      const pmDoc = doc(p('hello')) as Node;
      using testbed = setup(pmDoc);
      const {view} = testbed;

      expect(execRedo(view)).toBe(false);
      expect(redoDepth(view.state)).toBe(0);
    });
  });

  describe('remote transactions are NOT in undo/redo history', () => {
    test('remote insert does not increase undo depth', () => {
      const pmDoc = doc(p('hello')) as Node;
      using testbed = setup(pmDoc);
      const {view} = testbed;

      expect(undoDepth(view.state)).toBe(0);
      remoteInsert(view, 6, '!');
      expect(view.state.doc.textContent).toBe('hello!');
      expect(undoDepth(view.state)).toBe(0);
    });

    test('remote delete does not increase undo depth', () => {
      const pmDoc = doc(p('hello')) as Node;
      using testbed = setup(pmDoc);
      const {view} = testbed;

      expect(undoDepth(view.state)).toBe(0);
      remoteDelete(view, 1, 2);
      expect(view.state.doc.textContent).toBe('ello');
      expect(undoDepth(view.state)).toBe(0);
    });

    test('undo skips remote changes and only reverts local edit', () => {
      const pmDoc = doc(p('hello')) as Node;
      using testbed = setup(pmDoc);
      const {view} = testbed;

      // Local: insert 'X' at start -> "Xhello"
      typeAt(view, 1, 'X');
      expect(view.state.doc.textContent).toBe('Xhello');

      // Remote: insert 'Y' at end -> "XhelloY"
      remoteInsert(view, 7, 'Y');
      expect(view.state.doc.textContent).toBe('XhelloY');
      expect(undoDepth(view.state)).toBe(1);

      // Undo should revert only the local 'X', keeping remote 'Y'
      execUndo(view);
      expect(view.state.doc.textContent).toBe('helloY');
    });

    test('undo after remote insert before local edit adjusts positions correctly', () => {
      const pmDoc = doc(p('hello')) as Node;
      using testbed = setup(pmDoc);
      const {view} = testbed;

      // Local: insert 'X' at pos 3 -> "heXllo"
      typeAt(view, 3, 'X');
      expect(view.state.doc.textContent).toBe('heXllo');

      // Remote: insert 'AB' at pos 1 (before our 'X') -> "ABheXllo"
      remoteInsert(view, 1, 'AB');
      expect(view.state.doc.textContent).toBe('ABheXllo');

      // Undo should revert the local 'X' (now at a shifted position)
      execUndo(view);
      expect(view.state.doc.textContent).toBe('ABhello');
    });

    test('multiple remote edits do not accumulate undo depth', () => {
      const pmDoc = doc(p('abc')) as Node;
      using testbed = setup(pmDoc);
      const {view} = testbed;

      expect(undoDepth(view.state)).toBe(0);

      remoteInsert(view, 1, 'R');
      expect(view.state.doc.textContent).toBe('Rabc');
      expect(undoDepth(view.state)).toBe(0);

      remoteInsert(view, 5, 'S');
      expect(view.state.doc.textContent).toBe('RabcS');
      expect(undoDepth(view.state)).toBe(0);

      // Still nothing to undo
      expect(execUndo(view)).toBe(false);
    });
  });

  // ====================================================== Cursor positioning
  describe('cursor positioning after undo/redo', () => {
    test('cursor returns to insert position after undo', () => {
      const pmDoc = doc(p('hello')) as Node;
      using testbed = setup(pmDoc);
      const {view} = testbed;

      // Place cursor at end (pos 6) and type '!'
      typeAt(view, 6, '!');

      execUndo(view);
      // After undo, doc should be restored
      expect(view.state.doc.textContent).toBe('hello');
      // Cursor should be inside text content
      const pos = view.state.selection.from;
      expect(pos).toBeGreaterThanOrEqual(1);
      expect(pos).toBeLessThanOrEqual(6);
    });

    test('cursor is inside text content after undoing a deletion', () => {
      const pmDoc = doc(p('hello')) as Node;
      using testbed = setup(pmDoc);
      const {view} = testbed;

      // Delete 'h' at pos 1..2
      deleteRange(view, 1, 2);

      execUndo(view);
      // After undo, cursor should be in a valid position within the text
      const pos = view.state.selection.from;
      expect(pos).toBeGreaterThanOrEqual(1);
      expect(pos).toBeLessThanOrEqual(6); // "hello" is at positions 1-5, 6 = end
      expect(view.state.doc.textContent).toBe('hello');
    });

    test('cursor is at valid position after redo', () => {
      const pmDoc = doc(p('hello')) as Node;
      using testbed = setup(pmDoc);
      const {view} = testbed;

      typeAt(view, 6, '!');
      execUndo(view);
      execRedo(view);
      // After redo, doc should have the '!' back
      expect(view.state.doc.textContent).toBe('hello!');
      // Cursor should be inside text content
      const pos = view.state.selection.from;
      expect(pos).toBeGreaterThanOrEqual(1);
      expect(pos).toBeLessThanOrEqual(7);
    });
  });

  // =================== Remote sync via facade.set() preserves undo history
  describe('undo survives remote sync via set() (minimal reconciliation)', () => {
    test('local edit in paragraph 1, remote sync changes paragraph 2 — undo still works', () => {
      const pmDoc = doc(p('aaa'), p('bbb')) as Node;
      using testbed = setup(pmDoc);
      const {view, facade, api, txt} = testbed;

      // Local edit: prepend '1' to first paragraph
      typeAt(view, 1, '1');
      expect(view.state.doc.child(0).textContent).toBe('1aaa');
      expect(undoDepth(view.state)).toBeGreaterThan(0);

      // Simulate a remote change to the second paragraph by modifying the CRDT
      // directly and then syncing via set().
      // We modify txt directly (as if a remote peer inserted '2' in the 2nd paragraph).
      const secondParaStart = (txt.str.view() as string).indexOf('bbb');
      txt.insAt(secondParaStart, '2');
      txt.refresh();
      facade.set(txt.blocks);

      // Both paragraphs should now reflect their changes.
      expect(view.state.doc.child(0).textContent).toBe('1aaa');
      expect(view.state.doc.child(1).textContent).toBe('2bbb');

      // Undo should still revert the local '1' in paragraph 1.
      const undone = execUndo(view);
      expect(undone).toBe(true);
      expect(view.state.doc.child(0).textContent).toBe('aaa');
      // Remote change in paragraph 2 should be preserved.
      expect(view.state.doc.child(1).textContent).toBe('2bbb');
    });

    test('local edit in paragraph 2, remote sync changes paragraph 1 — undo still works', () => {
      const pmDoc = doc(p('aaa'), p('bbb')) as Node;
      using testbed = setup(pmDoc);
      const {view, facade, txt} = testbed;

      // PM positions: <doc> <p>(0) aaa(1-3) </p> <p>(5) bbb(6-8) </p>
      // Local edit: prepend '2' to second paragraph (pos 6)
      typeAt(view, 6, '2');
      expect(view.state.doc.child(1).textContent).toBe('2bbb');
      expect(undoDepth(view.state)).toBeGreaterThan(0);

      // Remote change to the first paragraph.
      const firstParaStart = (txt.str.view() as string).indexOf('aaa');
      txt.insAt(firstParaStart, '1');
      txt.refresh();
      facade.set(txt.blocks);

      expect(view.state.doc.child(0).textContent).toBe('1aaa');
      expect(view.state.doc.child(1).textContent).toBe('2bbb');

      // Undo should revert the local '2' in paragraph 2.
      const undone = execUndo(view);
      expect(undone).toBe(true);
      expect(view.state.doc.child(1).textContent).toBe('bbb');
      expect(view.state.doc.child(0).textContent).toBe('1aaa');
    });

    test('undo and redo both work after remote sync', () => {
      const pmDoc = doc(p('aaa'), p('bbb')) as Node;
      using testbed = setup(pmDoc);
      const {view, facade, txt} = testbed;

      // Local edit
      typeAt(view, 1, 'X');
      expect(view.state.doc.child(0).textContent).toBe('Xaaa');

      // Remote sync on paragraph 2
      const idx = (txt.str.view() as string).indexOf('bbb');
      txt.insAt(idx, 'Y');
      txt.refresh();
      facade.set(txt.blocks);

      expect(view.state.doc.child(0).textContent).toBe('Xaaa');
      expect(view.state.doc.child(1).textContent).toBe('Ybbb');

      // Undo local 'X'
      execUndo(view);
      expect(view.state.doc.child(0).textContent).toBe('aaa');
      expect(view.state.doc.child(1).textContent).toBe('Ybbb');

      // Redo local 'X'
      const redone = execRedo(view);
      expect(redone).toBe(true);
      expect(view.state.doc.child(0).textContent).toBe('Xaaa');
      expect(view.state.doc.child(1).textContent).toBe('Ybbb');
    });

    test('set() with no changes is a no-op (does not dispatch)', () => {
      const pmDoc = doc(p('hello'), p('world')) as Node;
      using testbed = setup(pmDoc);
      const {view, facade, txt} = testbed;

      const stateBefore = view.state;
      txt.refresh();
      facade.set(txt.blocks);
      // State should be the exact same object (no transaction dispatched).
      expect(view.state).toBe(stateBefore);
    });
  });

  describe('deep diff within a single paragraph preserves undo', () => {
    test('local prepend + remote append in same paragraph — undo reverts only local', () => {
      const pmDoc = doc(p('hello')) as Node;
      using testbed = setup(pmDoc);
      const {view, facade, txt} = testbed;

      // Local: prepend 'X' -> "Xhello"
      typeAt(view, 1, 'X');
      expect(view.state.doc.child(0).textContent).toBe('Xhello');
      expect(undoDepth(view.state)).toBeGreaterThan(0);

      // Remote: append 'Y' at the end of the same paragraph.
      const text = txt.str.view() as string;
      const helloEnd = text.indexOf('hello') + 'hello'.length;
      txt.insAt(helloEnd, 'Y');
      txt.refresh();
      facade.set(txt.blocks);

      expect(view.state.doc.child(0).textContent).toBe('XhelloY');

      // Undo should revert only the local 'X'.
      const undone = execUndo(view);
      expect(undone).toBe(true);
      expect(view.state.doc.child(0).textContent).toBe('helloY');
    });

    test('local append + remote prepend in same paragraph — undo reverts only local', () => {
      const pmDoc = doc(p('hello')) as Node;
      using testbed = setup(pmDoc);
      const {view, facade, txt} = testbed;

      // Local: append '!' -> "hello!"
      typeAt(view, 6, '!');
      expect(view.state.doc.child(0).textContent).toBe('hello!');
      expect(undoDepth(view.state)).toBeGreaterThan(0);

      // Remote: prepend 'R' at start of same paragraph.
      const text = txt.str.view() as string;
      const helloStart = text.indexOf('hello');
      txt.insAt(helloStart, 'R');
      txt.refresh();
      facade.set(txt.blocks);

      expect(view.state.doc.child(0).textContent).toBe('Rhello!');

      // Undo should revert only the local '!'.
      const undone = execUndo(view);
      expect(undone).toBe(true);
      expect(view.state.doc.child(0).textContent).toBe('Rhello');
    });

    test('mixed: para 1 unchanged, para 2 deep-diffed (local+remote), para 3 remote only — undo works', () => {
      const pmDoc = doc(p('aaa'), p('bbb'), p('ccc')) as Node;
      using testbed = setup(pmDoc);
      const {view, facade, txt} = testbed;

      // Local: edit paragraph 2 — insert 'X' at start of 'bbb'.
      typeAt(view, 6, 'X');
      expect(view.state.doc.child(1).textContent).toBe('Xbbb');
      expect(undoDepth(view.state)).toBeGreaterThan(0);

      // Remote: append 'Y' to paragraph 2 AND prepend 'Z' to paragraph 3.
      const text = txt.str.view() as string;
      const bbbEnd = text.indexOf('bbb') + 'bbb'.length;
      txt.insAt(bbbEnd, 'Y');
      const cccStart = (txt.str.view() as string).indexOf('ccc');
      txt.insAt(cccStart, 'Z');
      txt.refresh();
      facade.set(txt.blocks);

      expect(view.state.doc.child(0).textContent).toBe('aaa');
      expect(view.state.doc.child(1).textContent).toBe('XbbbY');
      expect(view.state.doc.child(2).textContent).toBe('Zccc');

      // Undo should revert the local 'X' in paragraph 2.
      const undone = execUndo(view);
      expect(undone).toBe(true);
      expect(view.state.doc.child(0).textContent).toBe('aaa');
      expect(view.state.doc.child(1).textContent).toBe('bbbY');
      // Remote change in paragraph 3 should be preserved.
      expect(view.state.doc.child(2).textContent).toBe('Zccc');
    });

    test('undo and redo both work after same-paragraph remote sync', () => {
      const pmDoc = doc(p('hello')) as Node;
      using testbed = setup(pmDoc);
      const {view, facade, txt} = testbed;

      // Local edit
      typeAt(view, 6, '!');
      expect(view.state.doc.child(0).textContent).toBe('hello!');

      // Remote: prepend 'R'
      const text = txt.str.view() as string;
      const start = text.indexOf('hello');
      txt.insAt(start, 'R');
      txt.refresh();
      facade.set(txt.blocks);

      expect(view.state.doc.child(0).textContent).toBe('Rhello!');

      // Undo local '!'
      execUndo(view);
      expect(view.state.doc.child(0).textContent).toBe('Rhello');

      // Redo local '!'
      const redone = execRedo(view);
      expect(redone).toBe(true);
      expect(view.state.doc.child(0).textContent).toBe('Rhello!');
    });
  });
});
