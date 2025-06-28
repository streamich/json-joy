import {Timestamp} from '../../../../json-crdt-patch/clock';
import {StrNode} from '../../../nodes';
import {Model} from '../../../model';
import type {SequentialTraceEditor} from '../types';

export const editorStrNode: SequentialTraceEditor = {
  name: 'StrNode (json-joy)',
  factory: () => {
    let time = 0;
    const rga = new StrNode(new Timestamp(1, time++));
    return {
      ins: (pos: number, insert: string) => {
        rga.insAt(pos, new Timestamp(1, time), insert);
        time += insert.length;
      },
      del: (pos: number, len: number) => {
        rga.delete(rga.findInterval(pos, len));
      },
      get: () => rga.view(),
      len: () => rga.length(),
      chunks: () => rga.size(),
    };
  },
};

export const editorJsonJoy: SequentialTraceEditor = {
  name: 'json-joy',
  factory: () => {
    const model = Model.withLogicalClock();
    model.api.set('');
    const str = model.api.str([]);
    return {
      ins: (pos: number, insert: string) => {
        str.ins(pos, insert);
      },
      del: (pos: number, len: number) => {
        str.del(pos, len);
      },
      get: () => str.view(),
      len: () => str.view().length,
      chunks: () => str.node.size(),
      toBlob: () => model.toBinary(),
    };
  },
};
