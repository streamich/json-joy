const Benchmark = require('benchmark');
const {Model} = require('../../es2020/json-crdt');
const {StrNode} = require('../../es2020/json-crdt/types/str/StrNode');
const Y = require('yjs');
const Automerge = require('automerge');
const {randomU32} = require('hyperdyperid/lib/randomU32');
const {ts} = require('../../es2020/json-crdt-patch/clock');

const insertPositions = [0, 100, 200, 300, 400, 500, 600, 700, 800, 900];
const variance = 5;

let str1 = '';
for (let i = 0; i < 1000; i++) str1 += '..........';
const str2 = '1234567890';
const len1 = str1.length;
const len2 = str2.length;

const type = new StrNode(ts(1, 1));
type.ins(ts(1, 1), ts(1, 2), str1);
let time = str1.length + 100;
const editStrNode = () => {
  for (let i = 0; i < insertPositions.length; i++) {
    const pos1 = insertPositions[i] + randomU32(0, variance);
    const pos2 = randomU32(0, len1 - len2);
    // type.insAt(pos1, ts(1, time), str2);
    type.ins(type.find(pos1), ts(1, time), str2);
    type.deleteInterval(pos2, str2.length);
    // type.delete(type.findInterval(pos2, str2.length));
    time += str2.length;
  }
};

const model = Model.withServerClock();
model.api.root(str1);
const node = model.api.str([]);
const editJsonCrdt = () => {
  for (let i = 0; i < insertPositions.length; i++) {
    const pos1 = insertPositions[i] + randomU32(0, variance);
    const pos2 = randomU32(0, len1 - len2);
    node.ins(pos1, str2);
    node.del(pos2, str2.length);
  }
};

const ydoc = new Y.Doc();
const ytext = ydoc.getText();
ytext.insert(0, str1);
const editYjs = () => {
  for (let i = 0; i < insertPositions.length; i++) {
    const pos1 = insertPositions[i] + randomU32(0, variance);
    const pos2 = randomU32(0, len1 - len2);
    ytext.insert(pos1, str2);
    ytext.delete(pos2, str2.length);
  }
};

let automergeDoc = Automerge.init();
automergeDoc = Automerge.change(automergeDoc, (doc) => {
  doc.text = new Automerge.Text();
  doc.text.insertAt(0, ...str1.split(''));
});
const editAutomerge = () => {
  for (let i = 0; i < insertPositions.length; i++) {
    const pos1 = insertPositions[i] + randomU32(0, variance);
    const pos2 = randomU32(0, len1 - len2);
    automergeDoc = Automerge.change(automergeDoc, (doc) => {
      doc.text.insertAt(pos1, ...str2.split(''));
      doc.text.deleteAt(pos2, str2.length);
    });
  }
};

for (let i = 0; i < 1000; i++) {
  editStrNode();
  editJsonCrdt();
  editYjs();
  editAutomerge();
}

const suite = new Benchmark.Suite();

suite
  .add('json-crdt StrNode type', function () {
    editStrNode();
  })
  .add('json-crdt', function () {
    editJsonCrdt();
  })
  .add('Y.js', function () {
    editYjs();
  })
  .add('Automerge', function () {
    editAutomerge();
  })
  .on('cycle', function (event) {
    console.log(String(event.target));
  })
  .on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run();

console.log('RgaString chunks:', type.size());
