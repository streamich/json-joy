import {ModelWithExt as Model, ext} from 'json-joy/lib/json-crdt-extensions';
import {FromSlate} from '../../FromSlate';
import {toSlate} from '../../toSlate';
import {type SlateTrace, SlateTraceRunner} from './traces';
import type {SlateDocument} from '../../../types';

export const assertSlatePeritextSlateRoundtrip = (doc: SlateDocument) => {
  const viewRange = FromSlate.convert(doc);
  const model = Model.create(ext.peritext.new(''));
  const api = model.s.toExt();
  api.txt.editor.import(0, viewRange);
  api.txt.refresh();
  const view = toSlate(api.txt);
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
  const model = Model.create(ext.peritext.new(''));
  const api = model.s.toExt();
  api.txt.editor.merge(FromSlate.convert(doc1));
  api.txt.refresh();
  const view = toSlate(api.txt);
  expect(view).toEqual(doc1);
  api.txt.editor.merge(FromSlate.convert(doc2));
  const view2 = toSlate(api.txt);
  expect(view2).toEqual(doc2);
  const model2 = Model.create(ext.peritext.new(''));
  const slate2 = model2.s.toExt();
  const viewRange2 = FromSlate.convert(doc2);
  slate2.txt.editor.merge(viewRange2);
  slate2.txt.refresh();
  expect(slate2.txt.editor.export()).toEqual(api.txt.editor.export());
};

export const assertCanMergeTrain = (docs: SlateDocument[]) => {
  const model = Model.create(ext.peritext.new(''));
  const slate = model.s.toExt();
  for (const doc of docs) {
    slate.txt.editor.merge(FromSlate.convert(doc));
    const view = toSlate(slate.txt);
    expect(view).toEqual(doc);
  }
};

export const assertEmptyMerge = (doc: SlateDocument) => {
  const model = Model.create(ext.peritext.new(''));
  const slate = model.s.toExt();
  slate.txt.editor.merge(FromSlate.convert(doc));
  slate.txt.refresh();
  const model2 = Model.create(ext.peritext.new(''));
  const slate2 = model2.s.toExt();
  slate2.txt.editor.merge(FromSlate.convert(doc));
  slate2.txt.refresh();
  expect(slate.txt.editor.export()).toEqual(slate2.txt.editor.export());
};
