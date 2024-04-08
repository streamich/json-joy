/**
 * NODE_ENV=production node --prof benchmarks/json-crdt/profiler/automerge-paper.js
 * node --prof-process isolate-0xnnnnnnnnnnnn-v8.log
 */

const {traces} = require('../../data/editing-traces');
const {StrNode} = require('../../../lib/json-crdt/types/str/StrNode');
const {ts} = require('../../../lib/json-crdt-patch/clock/logical');

const patches = traces.get('automerge-paper').txns.map((txn) => txn.patches[0]);
const length = patches.length;
console.log('Document operations:', length, patches);

const runStrNode = () => {
  console.log('---------------------------------------------');
  console.time('JSON CRDT StrNode');
  let time = 0;
  const rga = new StrNode(ts(1, time++));
  for (let i = 0; i < length; i++) {
    const [pos, del, c] = patches[i];
    if (del) {
      rga.deleteInterval(pos, del);
    } else {
      // rga.insAt(pos, ts(1, time++), c);
      rga.ins(pos ? rga.find(pos - 1) : rga.id, ts(1, time++), c);
    }
  }
  rga.view();
  // console.log(rga.view());
  console.timeEnd('JSON CRDT StrNode');
  console.log('String length:', rga.length(), ', Chunk count:', rga.size());
  // console.log(rga.toString());
};

runStrNode();
runStrNode();
runStrNode();
runStrNode();
runStrNode();
runStrNode();
