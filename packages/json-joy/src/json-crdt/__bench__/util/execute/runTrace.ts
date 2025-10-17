import type {SequentialTrace, SequentialTraceEditor} from '../types';

/* tslint:disable no-console */

export const runTrace = (trace: SequentialTrace, editor: SequentialTraceEditor) => {
  const txns = trace.txns;
  const txnsLength = txns.length;
  const editorInstance = editor.factory();
  if (trace.startContent) editorInstance.ins(0, trace.startContent);
  for (let i = 0; i < txnsLength; i++) {
    const transaction = txns[i];
    const patches = transaction.patches;
    const length = patches.length;
    for (let j = 0; j < length; j++) {
      const patch = patches[j];
      const pos = patch[0];
      const del = patch[1];
      const insert = patch[2];
      if (del) editorInstance.del(pos, del);
      if (insert) editorInstance.ins(pos, insert);
    }
  }
  return editorInstance;
};
