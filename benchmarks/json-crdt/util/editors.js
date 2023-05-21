const {traces} = require('../../data/editing-traces');
const {StringRga} = require('../../../es2020/json-crdt/types/rga-string/StringRga')
const {Timestamp} = require('../../../es2020/json-crdt-patch/clock/logical');
const {Doc} = require('diamond-types-node');
const Y = require('yjs');
const Automerge = require('@automerge/automerge');
const AutomergeUnstable = require('@automerge/automerge/dist/cjs/unstable');
const Rope = require('rope.js');
const Yrs = require('ywasm');

exports.editors = {
  'StringRga (json-joy)': {
    name: 'StringRga (json-joy)',
    factory: () => {
      let time = 0;
      const rga = new StringRga(new Timestamp(1, time++));
      return {
        ins: (pos, insert) => {
          rga.insAt(pos, new Timestamp(1, time), insert);
          time += insert.length;
        },
        del: (pos, len) => {
          rga.delete(rga.findInterval(pos, len));
        },
        get: () => rga.view(),
        len: () => rga.length(),
        chunks: () => rga.size(),
      };  
    },
  },
  'diamond-types-node': {
    name: 'diamond-types-node',
    factory: () => {
      const doc = new Doc("seph");
      return {
        ins: (pos, insert) => {
          doc.ins(pos, insert);
        },
        del: (pos, len) => {
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
      const ydoc = new Y.Doc()
      const ytext = ydoc.getText();
      return {
        ins: (pos, insert) => {
          ytext.insert(pos, insert);
        },
        del: (pos, len) => {
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
      const ydoc = new Yrs.YDoc()
      const ytext = ydoc.getText('test');
      return {
        ins: (pos, insert) => {
          ytext.insert(pos, insert);
        },
        del: (pos, len) => {
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
        ins: (pos, insert) => {
          str = str.slice(0, pos) + insert + str.slice(pos);
        },
        del: (pos, len) => {
          str = str.slice(0, pos) + str.slice(pos + len);
        },
        get: () => str,
        len: () => str.length,
        chunks: () => 0,
      };  
    },
  },
  'Automerge': {
    name: 'Automerge',
    factory: () => {
      let doc = Automerge.init();
      doc = Automerge.change(doc, doc => {
        doc.text = new Automerge.Text();
      });
      return {
        ins: (pos, insert) => {
          doc = Automerge.change(doc, doc => {
            doc.text.insertAt(pos, ...insert.split(''));
          });
        },
        del: (pos, len) => {
          doc = Automerge.change(doc, doc => {
            doc.text.deleteAt(pos, len);
          })
        },
        get: () => doc.text + '',
        len: () => doc.text.length,
        chunks: () => doc.text.elems.length,
      };
    },
  },
  'AutomergeUnstable': {
    name: 'AutomergeUnstable',
    factory: () => {
      let doc = AutomergeUnstable.from({text: ""})
      return {
        ins: (pos, insert) => {
          doc = AutomergeUnstable.change(doc, doc => {
            AutomergeUnstable.splice(doc, 'text', pos, 0, insert);
          });
        },
        del: (pos, len) => {
          doc = AutomergeUnstable.change(doc, doc => {
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
      var r = new Rope(['']);
      return {
        ins: (pos, insert) => {
          r.splice(pos, 0, insert);
        },
        del: (pos, len) => {
          r.splice(pos, len, '');
        },
        get: () => r.toString(),
        len: () => r.toString().length,
        chunks: () => r.segs.length,
      };  
    },
  },
};

exports.runTraceOnEditor = (json, editor) => {
  const txns = json.txns;
  const txnsLength = txns.length;
  const editorInstance = editor.factory();
  if (json.startContent) editor.ins(0, json.startContent);
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

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

exports.runTrace = (traceName, editorName, iterations = 1) => {
  const trace = traces.get(traceName);
  const editorFactory = exports.editors[editorName];
  let instance, view;
  console.log('----------------------------------------------------------------------------');
  console.log(editorFactory.name);
  console.log('----------------------------------------------------------------------------');
  let best = Infinity;
  let worst = 0;
  const measurements = [];
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    instance = exports.runTraceOnEditor(trace, editorFactory);
    view = instance.get();
    const end = performance.now();
    const ms = end - start;
    if (ms < best) best = ms;
    if (ms > worst) worst = ms;
    measurements.push(ms);
    // console.log('#' + (i + 1) + ':', Number((ms).toFixed(1)));
    console.log(Number((ms).toFixed(3)));
  }
  // console.log('Result:', view);
  console.log('Correct:', view === trace.endContent, 'Length:', instance.len(), 'Chunks:', instance.chunks());
  const avg = measurements.reduce((acc, x) => acc + x, 0) / measurements.length;
  console.log('Best:', Number(best.toFixed(1)), 'Worst:', Number(worst.toFixed(1)), 'Average:', Number(avg.toFixed(1)), 'Tx/sec:', numberWithCommas(Math.round(trace.txns.length / (avg / 1000))));
};
