import {logTree} from 'pojo-dump';
import {ModelWithExt as Model, ext} from '../../ModelWithExt';
import {FromPm} from '../FromPm';
import {Node} from 'prosemirror-model';
import {schema} from 'prosemirror-test-builder';

export const assertCanConvert = (doc: Node) => {
  const viewRange = FromPm.convert(doc);
  const model = Model.create(ext.prosemirror.new());
  const prosemirror = model.s.toExt();
  prosemirror.node.txt.editor.import(0, viewRange);
  prosemirror.node.txt.refresh();
  const view = prosemirror.view();
  // console.log(JSON.stringify(view, null, 2));
  // console.log(JSON.stringify(doc.toJSON(), null, 2));
  expect(view).toEqual(doc.toJSON());
};

export const assertCanMergeInto = (doc1: Node, doc2: Node) => {
  const model = Model.create(ext.prosemirror.new());
  const prosemirror = model.s.toExt();
  prosemirror.mergePmNode(doc1);
  prosemirror.node.txt.refresh();
  const view = prosemirror.view();
  // logTree(view);
  // logTree(prosemirror.node.txt.editor.export());
  expect(Node.fromJSON(schema, view).toJSON()).toEqual(doc1.toJSON());
  prosemirror.mergePmNode(doc2);
  const view2 = prosemirror.view();
  // logTree(view2);
  // logTree(doc2.toJSON());
  expect(Node.fromJSON(schema, view2).toJSON()).toEqual(doc2.toJSON());
  const model2 = Model.create(ext.prosemirror.new());
  const prosemirror2 = model2.s.toExt();
  const viewRange2 = FromPm.convert(doc2);
  prosemirror2.node.txt.editor.merge(viewRange2);
  prosemirror2.node.txt.refresh();
  expect(prosemirror2.node.txt.editor.export()).toEqual(prosemirror.node.txt.editor.export());
};

export const assertCanMergeTrain = (docs: Node[]) => {
  const model = Model.create(ext.prosemirror.new());
  const prosemirror = model.s.toExt();
  for (const doc of docs) {
    prosemirror.mergePmNode(doc);
    const view = prosemirror.view();
    // logTree(view);
    // logTree(prosemirror.node.txt.editor.export());
    expect(Node.fromJSON(schema, view).toJSON()).toEqual(doc.toJSON());
  }
};

export const assertEmptyMerge = (doc: Node) => {
  const model = Model.create(ext.prosemirror.new());
  const prosemirror = model.s.toExt();
  const patch1 = prosemirror.mergePmNode(doc);
  expect(patch1).not.toEqual([void 0, void 0, void 0]);
  prosemirror.node.txt.refresh();
  const patch2 = prosemirror.mergePmNode(doc);
  expect(patch2).not.toEqual([void 0, void 0, void 0]);
  prosemirror.node.txt.refresh();
  const patch3 = prosemirror.mergePmNode(doc);
  expect(patch3).not.toEqual([void 0, void 0, void 0]);
};
