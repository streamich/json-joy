import Delta from 'quill-delta';
import {mval as ValueMvExt} from '../../mval';
import {quill as QuillDeltaExt} from '..';
import {Model} from '../../../json-crdt/model';
import type {QuillTrace} from '../types';
import type {QuillDeltaApi} from '../QuillDeltaApi';
import {insertDeleteQuillTrace} from './traces/insert-delete';
import {basicAnnotationsQuillTrace} from './traces/basic-annotations';
import {boldGrowingQuillTrace} from './traces/growing-bold';
import {generalQuillTrace} from './traces/general';
import {boldUnBoldQuillTrace} from './traces/bold-unbold';
import {boldItalicUnitalicQuillTrace} from './traces/bold-italic-unitalic';
import {splitUnSplitQuillTrace} from './traces/split-unsplit';
import {blockHandlingQuillTrace} from './traces/blocks';
import {insertDeleteImageQuillTrace} from './traces/insert-delete-image';
import {annotateAnnotationsQuillTrace} from './traces/annotate-annotations';
import {fuzz1QuillTrace} from './traces/fuzz-1';
import {fuzz2QuillTrace} from './traces/fuzz-2';
import {fuzz3QuillTrace} from './traces/fuzz-3';
import {fuzz4QuillTrace} from './traces/fuzz-4';
import {fuzz5QuillTrace} from './traces/fuzz-5';
import {fuzz6QuillTrace} from './traces/fuzz-6';
import {fuzz7QuillTrace} from './traces/fuzz-7';

const assertTrace = (trace: QuillTrace, api: QuillDeltaApi) => {
  let delta = new Delta([]);
  const {transactions} = trace;
  const length = transactions.length;
  for (let i = 0; i < length; i++) {
    const transaction = transactions[i];
    delta = delta.compose(new Delta(transaction));
    api.apply(transaction);
    try {
      expect(api.node.view()).toEqual(delta.ops);
      expect(api.node.slices().doc.view()).toEqual(delta.ops);
    } catch (err) {
      api.node.txt.refresh();
      // console.log(api.node.txt + '');
      // console.log(delta.ops);
      // console.log(api.node.view());
      // tslint:disable-next-line:no-console
      console.log('index: ', i, transaction);
      throw err;
    }
  }
  expect(api.node.view()).toEqual(delta.ops);
  expect(api.node.slices().doc.view()).toEqual(trace.contents.ops);
};

type Trace = [name: string, trace: QuillTrace];

const traces: Trace[] = [
  ['insert-delete', insertDeleteQuillTrace],
  ['growing-bold', boldGrowingQuillTrace],
  ['basic-annotations', basicAnnotationsQuillTrace],
  ['bold-unbold', boldUnBoldQuillTrace],
  ['bold-italic-unitalic', boldItalicUnitalicQuillTrace],
  ['split-unsplit', splitUnSplitQuillTrace],
  ['general', generalQuillTrace],
  ['block-handling', blockHandlingQuillTrace],
  ['insert-delete-image', insertDeleteImageQuillTrace],
  ['annotate-annotations', annotateAnnotationsQuillTrace],
  ['fuzz-1', fuzz1QuillTrace],
  ['fuzz-2', fuzz2QuillTrace],
  ['fuzz-3', fuzz3QuillTrace],
  ['fuzz-4', fuzz4QuillTrace],
  ['fuzz-5', fuzz5QuillTrace],
  ['fuzz-6', fuzz6QuillTrace],
  ['fuzz-7', fuzz7QuillTrace],
];

for (const [name, trace] of traces) {
  test(name, () => {
    const model = Model.create();
    model.ext.register(ValueMvExt);
    model.ext.register(QuillDeltaExt);
    model.api.set(QuillDeltaExt.new(''));
    const quill = model.api.in().asExt(QuillDeltaExt);
    assertTrace(trace, quill);
  });
}
