import {ModelWithExt as Model, ext} from '../../../ModelWithExt';
import {FromSlate} from '../../FromSlate';
import {type SlateTrace, SlateTraceRunner} from './traces';
import type {SlateDocument} from '../../types';

export const assertSlatePeritextSlateRoundtrip = (doc: SlateDocument) => {
  const viewRange = FromSlate.convert(doc);
  const model = Model.create(ext.slate.new());
  const slate = model.s.toExt();
  slate.node.txt.editor.import(0, viewRange);
  slate.node.txt.refresh();
  const view = slate.view();
  expect(view).toEqual(doc);
};

export const assertRoundtripForTraceCheckpoints = (trace: SlateTrace) => {
  const runner = new SlateTraceRunner(trace);
  while (!runner.endReached()) {
    runner.toNextCheckpoint();
    const state = runner.state();
    try {
      assertSlatePeritextSlateRoundtrip(state);
    } catch (error) {
      console.log('nextOpIdx:', runner.nextOpIdx);
      console.log(`operation (${runner.nextOpIdx - 1}):`, runner.trace.operations[runner.nextOpIdx - 1]);
      console.log(`operation (${runner.nextOpIdx}):`, runner.trace.operations[runner.nextOpIdx]);
      console.log(JSON.stringify(runner.editor.children, null, 2));
      throw error;
    }
  }
};

export const assertCanMergeInto = (doc1: SlateDocument, doc2: SlateDocument) => {
  const model = Model.create(ext.slate.new());
  const slate = model.s.toExt();
  slate.mergeSlateDoc(doc1);
  slate.node.txt.refresh();
  const view = slate.view();
  expect(view).toEqual(doc1);
  slate.mergeSlateDoc(doc2);
  const view2 = slate.view();
  expect(view2).toEqual(doc2);
  const model2 = Model.create(ext.slate.new());
  const slate2 = model2.s.toExt();
  const viewRange2 = FromSlate.convert(doc2);
  slate2.node.txt.editor.merge(viewRange2);
  slate2.node.txt.refresh();
  expect(slate2.node.txt.editor.export()).toEqual(slate.node.txt.editor.export());
};

export const assertCanMergeTrain = (docs: SlateDocument[]) => {
  const model = Model.create(ext.slate.new());
  const slate = model.s.toExt();
  for (const doc of docs) {
    slate.mergeSlateDoc(doc);
    const view = slate.view();
    expect(view).toEqual(doc);
  }
};

export const assertEmptyMerge = (doc: SlateDocument) => {
  const model = Model.create(ext.slate.new());
  const slate = model.s.toExt();
  slate.mergeSlateDoc(doc);
  slate.node.txt.refresh();
  const model2 = Model.create(ext.slate.new());
  const slate2 = model2.s.toExt();
  slate2.mergeSlateDoc(doc);
  slate2.node.txt.refresh();
  expect(slate.node.txt.editor.export()).toEqual(slate2.node.txt.editor.export());
};
