import {ModelWithExt as Model, ext} from 'json-joy/lib/json-crdt-extensions';
import {FromPm} from '../sync/FromPm';
import {ToPmNode} from '../sync/toPmNode';
import {Node} from 'prosemirror-model';
import {schema} from 'prosemirror-test-builder';
import {EditorState, TextSelection} from 'prosemirror-state';
import {EditorView} from 'prosemirror-view';
import {ProseMirrorFacade} from '../ProseMirrorFacade';
import {PeritextBinding} from '@jsonjoy.com/collaborative-peritext';

export const assertCanConvert = (doc: Node) => {
  const viewRange = FromPm.convert(doc);
  const model = Model.create(ext.peritext.new(''));
  const api = model.s.toExt();
  api.txt.editor.import(0, viewRange);
  api.txt.refresh();
  const toPm = new ToPmNode(schema);
  const view = toPm.convert(api.txt.blocks).toJSON();
  // console.log(JSON.stringify(view, null, 2));
  // console.log(JSON.stringify(doc.toJSON(), null, 2));
  expect(view).toEqual(doc.toJSON());
};

export const assertCanMergeInto = (doc1: Node, doc2: Node) => {
  const toPm = new ToPmNode(schema);
  const model = Model.create(ext.peritext.new(''));
  const api = model.s.toExt();
  api.txt.editor.merge(FromPm.convert(doc1));
  api.txt.refresh();
  const view = toPm.convert(api.txt.blocks).toJSON();
  // logTree(view);
  // logTree(api.txt.editor.export());
  expect(Node.fromJSON(schema, view).toJSON()).toEqual(doc1.toJSON());
  api.txt.editor.merge(FromPm.convert(doc2));
  api.txt.refresh();
  const view2 = toPm.convert(api.txt.blocks).toJSON();
  // logTree(view2);
  // logTree(doc2.toJSON());
  expect(Node.fromJSON(schema, view2).toJSON()).toEqual(doc2.toJSON());
  const model2 = Model.create(ext.peritext.new(''));
  const api2 = model2.s.toExt();
  const viewRange2 = FromPm.convert(doc2);
  api2.txt.editor.merge(viewRange2);
  api2.txt.refresh();
  expect(api2.txt.editor.export()).toEqual(api.txt.editor.export());
};

export const assertCanMergeTrain = (docs: Node[]) => {
  const toPm = new ToPmNode(schema);
  const model = Model.create(ext.peritext.new(''));
  const api = model.s.toExt();
  for (const doc of docs) {
    api.txt.editor.merge(FromPm.convert(doc));
    api.txt.refresh();
    const view = toPm.convert(api.txt.blocks).toJSON();
    // logTree(view);
    // logTree(api.txt.editor.export());
    expect(Node.fromJSON(schema, view).toJSON()).toEqual(doc.toJSON());
  }
};

export const assertEmptyMerge = (doc: Node) => {
  const model = Model.create(ext.peritext.new(''));
  const api = model.s.toExt();
  const patch1 = api.txt.editor.merge(FromPm.convert(doc));
  expect(patch1).not.toEqual([void 0, void 0, void 0]);
  api.txt.refresh();
  const patch2 = api.txt.editor.merge(FromPm.convert(doc));
  expect(patch2).toEqual([void 0, void 0, void 0]);
  api.txt.refresh();
  const patch3 = api.txt.editor.merge(FromPm.convert(doc));
  expect(patch3).toEqual([void 0, void 0, void 0]);
};

export const setup = (pmDoc: Node) => {
  // 1. Create Peritext model
  const model = Model.create(ext.peritext.new(''));
  const api = model.s.toExt();
  const txt = api.txt;

  // 1.2 Set the PM doc as the initial content of the Peritext model.
  const viewRange = FromPm.convert(pmDoc);
  txt.editor.import(0, viewRange);
  txt.refresh();

  // 2. Create a real ProseMirror EditorView in jsdom
  const place = document.createElement('div');
  document.body.appendChild(place);
  const state = EditorState.create({doc: pmDoc});
  const view = new EditorView(place, {state});

  // 3. Wrap with ProseMirrorFacade and bind to the Peritext model
  const facade = new ProseMirrorFacade(view, () => api);
  const unbind = PeritextBinding.bind(() => api, facade);

  const cleanup = () => {
    unbind();
    facade.dispose();
    view.destroy();
    document.body.removeChild(place);
  };

  return {
    facade,
    view,
    api,
    txt,
    cleanup,
    unbind,
    getSelectionAt: (anchor: number, head: number) => {
      const {doc} = view.state;
      const sel = TextSelection.create(doc, anchor, head);
      const tr = view.state.tr.setSelection(sel);
      view.dispatch(tr);
      return facade.getSelection(api);
    },
    [Symbol.dispose]() {
      cleanup();
    },
  };
};
