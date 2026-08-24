/** @jest-environment jsdom */

import {TextSelection} from 'prosemirror-state';
import type {Node} from 'prosemirror-model';
import {doc, p} from 'prosemirror-test-builder';
import {ModelWithExt as Model, ext} from 'json-joy/lib/json-crdt-extensions';
import {FromPm} from '../sync/FromPm';
import {setup} from './setup';
import {onlyNode24AndHigher} from './test-helpers';

/** Build a Peritext `txt.blocks` fragment equivalent to the given PM doc. */
const fragmentOf = (pmDoc: Node) => {
  const model = Model.create(ext.peritext.new(''));
  const api = model.s.toExt();
  api.txt.editor.import(0, FromPm.convert(pmDoc));
  api.txt.refresh();
  return api.txt.blocks;
};

onlyNode24AndHigher('ProseMirrorFacade selection restore on remote set()', () => {
  test('set() must not throw when the mapped selection lands outside inline content', () => {
    // Local doc has three paragraphs and the user's caret sits in the LAST one.
    const pmDoc = doc(p('aaa'), p('bbb'), p('ccc')) as Node;
    using testbed = setup(pmDoc);
    const {facade, view} = testbed;

    // Caret inside "ccc" (last textblock).
    const endPos = view.state.doc.content.size - 2;
    view.dispatch(view.state.tr.setSelection(TextSelection.create(view.state.doc, endPos)));

    // A remote update replaces the document with a SHORTER one — the trailing
    // blocks (including the one holding the caret) disappear. The old caret
    // position maps to the end of the new doc, which is a doc-level position
    // with no inline content; `TextSelection.create` throws
    // "TextSelection endpoint not pointing into a node with inline content".
    // Because `set()` also runs inside `PeritextBinding.bind()`'s initial
    // `syncFromModel()`, that throw aborts the whole binding: the editor stays
    // permanently unwired and local edits are silently lost.
    expect(() => facade.set(fragmentOf(doc(p('aaa')) as Node))).not.toThrow();

    // The remote content landed…
    expect(view.state.doc.textContent).toBe('aaa');
    // …and the restored selection is a valid position inside inline content.
    const sel = view.state.selection;
    expect(sel.$head.parent.inlineContent).toBe(true);
  });

  test('set() keeps an in-range mapped selection exactly where it was', () => {
    const pmDoc = doc(p('Hello'), p('World')) as Node;
    using testbed = setup(pmDoc);
    const {facade, view} = testbed;

    // Caret after "He" in the first paragraph — untouched by the remote change.
    view.dispatch(view.state.tr.setSelection(TextSelection.create(view.state.doc, 3)));

    // Remote edit only changes the SECOND paragraph.
    facade.set(fragmentOf(doc(p('Hello'), p('Peers')) as Node));

    expect(view.state.doc.textContent).toBe('HelloPeers');
    expect(view.state.selection.head).toBe(3);
  });
});
