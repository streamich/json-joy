import {Timestamp} from '../../../json-crdt-patch/clock';
import {StringRga} from '../../types/rga-string/StringRga';
import {Model} from '../../model';
import {Doc} from 'diamond-types-node';
import * as Y from 'yjs';
import Yrs from 'ywasm';
import * as Automerge from '@automerge/automerge';
import type {SequentialTraceEditor} from './types';
const AutomergeUnstable = require('@automerge/automerge/dist/cjs/unstable');
const Rope = require('rope.js');

export const editors = {
  'StringRga (json-joy)': {
    name: 'StringRga (json-joy)',
    factory: () => {
      let time = 0;
      const rga = new StringRga(new Timestamp(1, time++));
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
  } as SequentialTraceEditor,
  'json-joy': {
    name: 'json-joy',
    factory: () => {
      const model = Model.withLogicalClock();
      model.api.root('');
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
      };
    },
  },
  'diamond-types-node': {
    name: 'diamond-types-node',
    factory: () => {
      const doc = new Doc('seph');
      return {
        ins: (pos: number, insert: string) => {
          doc.ins(pos, insert);
        },
        del: (pos: number, len: number) => {
          doc.del(pos, len);
        },
        get: () => doc.get(),
        len: () => doc.get().length,
        chunks: () => 0,
      };
    },
  },
  'Y.js': {
    name: 'Y.js',
    factory: () => {
      const ydoc = new Y.Doc();
      const ytext = ydoc.getText();
      return {
        ins: (pos: number, insert: string) => {
          ytext.insert(pos, insert);
        },
        del: (pos: number, len: number) => {
          ytext.delete(pos, len);
        },
        get: () => ytext.toString(),
        len: () => ytext.toString().length,
        chunks: () => {
          let cnt = 0;
          let curr = ytext._start;
          while (curr) {
            cnt++;
            curr = curr.right;
          }
          return cnt;
        },
      };
    },
  },
  'Y.rs': {
    name: 'Y.rs',
    factory: () => {
      const ydoc = new Yrs.YDoc({});
      const ytext = ydoc.getText('test');
      return {
        ins: (pos: number, insert: string) => {
          ytext.insert(pos, insert, undefined);
        },
        del: (pos: number, len: number) => {
          ytext.delete(pos, len);
        },
        get: () => ytext.toString(),
        len: () => ytext.toString().length,
        chunks: () => 0,
      };
    },
  },
  'V8 strings': {
    name: 'V8 strings',
    factory: () => {
      let str = '';
      return {
        ins: (pos: number, insert: string) => {
          str = str.slice(0, pos) + insert + str.slice(pos);
        },
        del: (pos: number, len: number) => {
          str = str.slice(0, pos) + str.slice(pos + len);
        },
        get: () => str,
        len: () => str.length,
        chunks: () => 0,
      };
    },
  },
  Automerge: {
    name: 'Automerge',
    factory: () => {
      let doc = Automerge.init();
      doc = Automerge.change(doc, (doc) => {
        (<any>doc).text = new Automerge.Text();
      });
      return {
        ins: (pos: number, insert: string) => {
          doc = Automerge.change(doc, (doc) => {
            (<any>doc).text.insertAt(pos, ...insert.split(''));
          });
        },
        del: (pos: number, len: number) => {
          doc = Automerge.change(doc, (doc) => {
            (<any>doc).text.deleteAt(pos, len);
          });
        },
        get: () => (doc as any).text + '',
        len: () => (doc as any).text.length,
        chunks: () => (doc as any).text.elems.length,
      };
    },
  },
  AutomergeUnstable: {
    name: 'AutomergeUnstable',
    factory: () => {
      let doc = AutomergeUnstable.from({text: ''});
      return {
        ins: (pos: number, insert: string) => {
          doc = AutomergeUnstable.change(doc, (doc: any) => {
            AutomergeUnstable.splice(doc, 'text', pos, 0, insert);
          });
        },
        del: (pos: number, len: number) => {
          doc = AutomergeUnstable.change(doc, (doc: any) => {
            AutomergeUnstable.splice(doc, 'text', pos, len);
          });
        },
        get: () => AutomergeUnstable.toJS(doc).text,
        len: () => AutomergeUnstable.toJS(doc).text.length,
        chunks: () => 0,
      };
    },
  },
  'rope.js': {
    name: 'rope.js',
    factory: () => {
      const r = new Rope(['']);
      return {
        ins: (pos: number, insert: string) => {
          r.splice(pos, 0, insert);
        },
        del: (pos: number, len: number) => {
          r.splice(pos, len, '');
        },
        get: () => r.toString(),
        len: () => r.toString().length,
        chunks: () => r.segs.length,
      };
    },
  },
};

export type SequentialEditorName = keyof typeof editors;
