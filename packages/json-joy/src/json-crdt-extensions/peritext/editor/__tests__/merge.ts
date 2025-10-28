import type {ViewRange} from '../types';
// import {logTree, toTree} from 'pojo-dump';
import {ModelWithExt, ext} from '../../../ModelWithExt';
import type {PeritextNode} from '../../PeritextNode';
import type {Model} from '../../../../json-crdt/model';
import type {ExtensionNode} from '../../../../json-crdt/schema/types';

// const normalizeViewRange = (view: ViewRange): void => {
//   const [, offset, slices] = view;
//   const length = slices.length;
//   if (offset > 0) {
//     view[1] = 0;
//     for (let i = 0; i < length; i++) {
//       const slice = slices[i];
//       slice[1] += offset;
//       slice[2] += offset;
//     }
//   }
//   slices.sort((a, b) => a[1] - b[1] || a[2] - b[2] || 1);
// };

export const assertCanMergeInto = (model: Model<ExtensionNode<PeritextNode>>, view: ViewRange): void => {
  // logTree(view);
  try {
    const txt = model.s.toExt().txt;
    txt.editor.merge(view);
    txt.refresh();
    const view2 = txt.editor.export();
    // logTree(view2);
    // console.log(txt + '');
    // console.log(model + '');
    // console.log(txt + '');
    // expect(toTree(view2)).toBe(toTree(view));
    expect(view2).toEqual(view);
  } catch (error) {
    // console.log(toTree(view));
    console.log(JSON.stringify(view));
    throw error;
  }
};

export const assertCanMergeIntoEmptyDocument = (view: ViewRange): void => {
  const model = ModelWithExt.create(ext.peritext.new(''));
  assertCanMergeInto(model, view);
};

export const assertCanMergeViewTrain = (views: ViewRange[]): void => {
  const model = ModelWithExt.create(ext.peritext.new(''), 1234567890123);
  for (const view of views) {
    // console.log(`Merging view ${i++} of ${views.length}`);
    assertCanMergeInto(model, view);
  }
};
