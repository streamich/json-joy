/** @jest-environment jsdom */

import {Node} from 'prosemirror-model';
import {doc, p, strong} from 'prosemirror-test-builder';
import {setup} from './setup';
import {create} from 'json-joy/lib/json-crdt-extensions/peritext/transfer/create';

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

describe('ProseMirrorFacade — mark boundary handling', () => {
  describe('insert right after bold text extends the bold mark', () => {
    // Document: <p>normal <strong>bold</strong> tail</p>
    //
    // Inserting right after the last bold char should get the
    // bold mark from ProseMirror (marks are inclusive by default). The
    // fast-path must bail out so the full merge propagates the bold annotation
    // into Peritext correctly.

    test('character inserted at the end of bold is bold in ProseMirror and Peritext', () => {
      const pmDoc = doc(p('normal ', strong('bold'), ' tail')) as Node;
      using testbed = setup(pmDoc);
      const {view, txt} = testbed;

      // Insert 'X' right after "bold" (PM pos 12)
      typeAt(view, 12, 'X');

      const pmJson = view.state.doc.toJSON();
      const expected = doc(p('normal ', strong('boldX'), ' tail')) as Node;
      expect(pmJson).toEqual(expected.toJSON());

      txt.refresh();
      const transfer = create(txt);
      const md = transfer.toMarkdown(txt.rangeAll()!);
      expect(md).toContain('<strong>boldX</strong>');
    });
  });

  describe('delete char after bold, then insert — new char is NOT bold', () => {
    // Document: <p>normal <strong>bold</strong>x tail</p>
    // -----------------------------------------^
    //
    // Step 1: delete the plain "x" at pos [12, 13)
    // After delete: <p>normal <strong>bold</strong> tail</p>
    //   Now PM pos 12 = " " (first char of " tail", plain text)
    //
    // Step 2: insert 'Y' at pos 12
    //
    // In a real browser, after deleting plain "x" the cursor retains the
    // plain-text (no marks) context — the DOM cursor sits outside the
    // <strong> element. ProseMirror's native input handler reads that DOM
    // context, so newly typed text does NOT inherit bold. In programmatic
    // tests we simulate this by explicitly clearing storedMarks on the
    // insert transaction, which is what the browser effectively does.

    test('character inserted after deleting the non-bold char is NOT bold', () => {
      const pmDoc = doc(p('normal ', strong('bold'), 'x tail')) as Node;
      using testbed = setup(pmDoc);
      const {view, txt} = testbed;

      // Delete 'x' (PM position 12 to 13)
      deleteRange(view, 12, 13);

      // The doc is now: <p>normal <strong>bold</strong> tail</p>
      const afterDelete = doc(p('normal ', strong('bold'), ' tail')) as Node;
      expect(view.state.doc.toJSON()).toEqual(afterDelete.toJSON());

      // Insert 'Y' at pos 12 with empty storedMarks — simulates the cursor
      // context that the browser preserves after deleting a plain character.
      const {state} = view;
      const tr = state.tr.setStoredMarks([]).insertText('Y', 12);
      view.dispatch(tr);

      const pmJson = view.state.doc.toJSON();
      const expected = doc(p('normal ', strong('bold'), 'Y tail')) as Node;
      expect(pmJson).toEqual(expected.toJSON());

      txt.refresh();
      const transfer = create(txt);
      const md = transfer.toMarkdown(txt.rangeAll()!);
      expect(md).toContain('<strong>bold</strong>');
      expect(md).not.toContain('<strong>boldY</strong>');
    });
  });
});
