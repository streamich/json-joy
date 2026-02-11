/** @jest-environment jsdom */

import {Node} from 'prosemirror-model';
import {doc, p, blockquote, h1, em, strong} from 'prosemirror-test-builder';
import {setup} from './setup';

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

const replaceWithText = (view: ReturnType<typeof setup>['view'], from: number, to: number, text: string) => {
  const {state} = view;
  const tr = state.tr.insertText(text, from, to);
  view.dispatch(tr);
};

describe('ProseMirrorFacade — PeritextOperation fast path', () => {
  describe('character insertion', () => {
    test('typing a single character at start, middle, end of paragraph', () => {
      const pmDoc = doc(p('hello')) as Node;
      using testbed = setup(pmDoc);
      const {view, txt} = testbed;
      typeAt(view, 1, 'X');
      expect(txt.str.view()).toBe('\nXhello');
      typeAt(view, 3, 'Y');
      expect(txt.str.view()).toBe('\nXhYello');
      typeAt(view, 8, 'Z');
      expect(txt.str.view()).toBe('\nXhYelloZ');
    });

    test('typing multiple characters (paste-like)', () => {
      const pmDoc = doc(p('ab')) as Node;
      using testbed = setup(pmDoc);
      const {view, txt} = testbed;
      typeAt(view, 2, 'XYZ');
      expect(txt.str.view()).toBe('\naXYZb');
    });

    test('typing in second paragraph', () => {
      const pmDoc = doc(p('hello'), p('world')) as Node;
      using testbed = setup(pmDoc);
      const {view, txt} = testbed;
      // PM: <doc> <p>(0) hello(1-5) </p> <p>(7) world(8-12) </p>
      // pos 8 = 'w', insert before 'w'
      typeAt(view, 8, 'X');
      expect(txt.str.view()).toBe('\nhello\nXworld');
    });
  });

  describe('character deletion', () => {
    test('backspace (delete single char)', () => {
      const pmDoc = doc(p('hello')) as Node;
      using testbed = setup(pmDoc);
      const {view, txt} = testbed;
      // Delete the 'h' at position 1..2
      deleteRange(view, 1, 2);
      expect(txt.str.view()).toBe('\nello');
    });

    test('forward delete (single char)', () => {
      const pmDoc = doc(p('hello')) as Node;
      using testbed = setup(pmDoc);
      const {view, txt} = testbed;
      // Delete 'o' at position 5..6
      deleteRange(view, 5, 6);
      expect(txt.str.view()).toBe('\nhell');
    });

    test('delete middle character', () => {
      const pmDoc = doc(p('hello')) as Node;
      using testbed = setup(pmDoc);
      const {view, txt} = testbed;
      // Delete 'l' at position 3..4
      deleteRange(view, 3, 4);
      expect(txt.str.view()).toBe('\nhelo');
    });

    test('delete in second paragraph', () => {
      const pmDoc = doc(p('ab'), p('cd')) as Node;
      using testbed = setup(pmDoc);
      const {view, txt} = testbed;
      // PM: <doc> <p>(0) ab(1-2) </p> <p>(4) cd(5-6) </p>
      // Delete 'c' at pos 5..6
      deleteRange(view, 5, 6);
      expect(txt.str.view()).toBe('\nab\nd');
    });
  });

  describe('text replacement', () => {
    test('replacing a selection with text', () => {
      const pmDoc = doc(p('hello')) as Node;
      using testbed = setup(pmDoc);
      const {view, txt} = testbed;
      // Replace 'ell' (pos 2..5) with 'a'
      replaceWithText(view, 2, 5, 'a');
      expect(txt.str.view()).toBe('\nhao');
    });

    test('replacing single char with another', () => {
      const pmDoc = doc(p('abc')) as Node;
      using testbed = setup(pmDoc);
      const {view, txt} = testbed;
      // Replace 'b' (pos 2..3) with 'X'
      replaceWithText(view, 2, 3, 'X');
      expect(txt.str.view()).toBe('\naXc');
    });
  });

  describe('typing inside marks', () => {
    test('typing inside emphasized text', () => {
      const pmDoc = doc(p('a', em('bc'), 'd')) as Node;
      using testbed = setup(pmDoc);
      const {view, txt} = testbed;
      // PM: <doc> <p>(0) a(1) b(2) c(3) d(4) </p>
      // pos 2 = before 'b' (just inside the em), pos 3 = between 'b' and 'c'
      typeAt(view, 3, 'X');
      expect(txt.str.view()).toBe('\nabXcd');
    });

    test('typing inside bold text', () => {
      const pmDoc = doc(p('a', strong('bc'), 'd')) as Node;
      using testbed = setup(pmDoc);
      const {view, txt} = testbed;
      typeAt(view, 3, 'Y');
      expect(txt.str.view()).toBe('\nabYcd');
    });

    test('typing inside nested em+strong', () => {
      const pmDoc = doc(p('a', em(strong('bc')), 'd')) as Node;
      using testbed = setup(pmDoc);
      const {view, txt} = testbed;
      typeAt(view, 3, 'Z');
      expect(txt.str.view()).toBe('\nabZcd');
    });
  });

  describe('block structures', () => {
    test('typing inside a blockquote', () => {
      const pmDoc = doc(blockquote(p('hello'))) as Node;
      using testbed = setup(pmDoc);
      const {view, txt} = testbed;
      // PM: <doc> <blockquote>(0) <p>(1) hello(2-6) </p> </blockquote>
      // pos 2 = before 'h'
      typeAt(view, 2, 'X');
      expect(txt.str.view()).toBe('\nXhello');
    });

    test('typing inside a heading uses fast path', () => {
      const pmDoc = doc(h1('Title'), p('Body')) as Node;
      using testbed = setup(pmDoc);
      const {view, txt} = testbed;
      // PM: <doc> <h1>(0) Title(1-5) </h1> <p>(7) Body(8-11) </p>
      typeAt(view, 6, '!');
      expect(txt.str.view()).toBe('\nTitle!\nBody');
    });

    test('deleting inside a blockquote uses fast path', () => {
      const pmDoc = doc(blockquote(p('hello'))) as Node;
      using testbed = setup(pmDoc);
      const {view, txt} = testbed;
      // Delete 'e' at pos 3..4
      deleteRange(view, 3, 4);
      expect(txt.str.view()).toBe('\nhllo');
    });
  });

  describe('falls back to full merge for complex operations', () => {
    test('pressing Enter (block split) falls back to full merge', () => {
      const pmDoc = doc(p('hello')) as Node;
      using testbed = setup(pmDoc);
      const {view, txt} = testbed;
      // Simulate Enter by splitting via ReplaceStep with open depths
      const {state} = view;
      const tr = state.tr.split(3);
      view.dispatch(tr);
      // Should still work (via full merge).
      txt.refresh();
      expect(txt.str.view()).toBe('\nhe\nllo');
    });
  });

  describe('sequential fast-path edits', () => {
    test('multiple fast-path inserts in sequence', () => {
      const pmDoc = doc(p('ab')) as Node;
      using testbed = setup(pmDoc);
      const {view, txt} = testbed;
      typeAt(view, 2, 'X');
      expect(txt.str.view()).toBe('\naXb');
      // After first insert, PM doc is now 'aXb'; pos 3 = after 'X'
      typeAt(view, 3, 'Y');
      expect(txt.str.view()).toBe('\naXYb');
      typeAt(view, 4, 'Z');
      expect(txt.str.view()).toBe('\naXYZb');
    });

    test('insert then delete in sequence', () => {
      const pmDoc = doc(p('abc')) as Node;
      using testbed = setup(pmDoc);
      const {view, txt} = testbed;
      typeAt(view, 2, 'X');
      expect(txt.str.view()).toBe('\naXbc');
      // Delete the 'X' we just inserted (pos 2..3)
      deleteRange(view, 2, 3);
      expect(txt.str.view()).toBe('\nabc');
    });

    test('delete then insert in sequence', () => {
      const pmDoc = doc(p('abc')) as Node;
      using testbed = setup(pmDoc);
      const {view, txt} = testbed;
      deleteRange(view, 2, 3);
      expect(txt.str.view()).toBe('\nac');
      typeAt(view, 2, 'X');
      expect(txt.str.view()).toBe('\naXc');
    });
  });
});
