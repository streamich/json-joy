const Benchmark = require('benchmark');
const {Model} = require('../../es2020/json-crdt');
const {StringRga} = require('../../es2020/json-crdt/types/rga-string/StringRga');
const Y = require('yjs');
const Automerge = require('automerge');
const {randomU32} = require('hyperdyperid/lib/randomU32');
const {ts} = require('../../es2020/json-crdt-patch/clock');

let str1 = '';
for (let i = 0; i < 1000; i++) str1 += '..........';
const arr = [];
for (let i = 0; i < 10000; i++) arr.push({i: null, r: null, p: null, content: {}, deleted: false, id: [1, 2]});
const str2 = '1234567890';
const len1 = str1.length;
const len2 = str2.length;

const editStringRga = () => {
  const type = new StringRga(ts(1, 1));
  type.ins(ts(1, 1), ts(1, 2), str1);
  let time = str1.length + 100;
  for (let i = 0; i < 10; i++) {
    const pos1 = randomU32(0, len1 - len2);
    type.ins(type.find(pos1), ts(1, time), str2);
    time += str2.length;
  }
  const pos2 = randomU32(0, len1 - len2);
  type.deleteInterval(pos2, str2.length);
  // type.delete(type.findInterval(pos2, str2.length));
};

const editJsonCrdt = () => {
  const model = Model.withServerClock();
  model.api.root(str1);
  const node = model.api.str([]);
  for (let i = 0; i < 10; i++) {
    const pos1 = randomU32(0, len1 - len2);
    node.ins(pos1, str2);
  }
  const pos2 = randomU32(0, len1 - len2);
  node.del(pos2, str2.length);
};

const editYjs = () => {
  const ydoc = new Y.Doc();
  const ytext = ydoc.getText();
  ytext.insert(0, str1);
  for (let i = 0; i < 10; i++) {
    const pos1 = randomU32(0, len1 - len2);
    ytext.insert(pos1, str2);
  }
  const pos2 = randomU32(0, len1 - len2);
  ytext.delete(pos2, str2.length);
};

const editAutomerge = () => {
  let automergeDoc = Automerge.init();
  automergeDoc = Automerge.change(automergeDoc, (doc) => {
    doc.text = new Automerge.Text();
    doc.text.insertAt(0, ...str1.split(''));
  });
  for (let i = 0; i < 10; i++) {
    const pos1 = randomU32(0, len1 - len2);
    automergeDoc = Automerge.change(automergeDoc, (doc) => {
      doc.text.insertAt(pos1, ...str2.split(''));
    });
  }
  const pos2 = randomU32(0, len1 - len2);
  automergeDoc = Automerge.change(automergeDoc, (doc) => {
    doc.text.deleteAt(pos2, str2.length);
  });
};

for (let i = 0; i < 10; i++) {
  editStringRga();
  editJsonCrdt();
  editYjs();
  editAutomerge();
}

const suite = new Benchmark.Suite();

suite
  // .add('arr', function() {
  //   const pos1 = randomU32(0, len1 - len2);
  //   const pos2 = randomU32(0, len1 - len2);
  //   arr.splice(pos1, {i: null, r: null, p: null, content: {}, deleted: false, id: [1 ,2]}, {i: null, r: null, p: null, content: {}, deleted: false, id: [1 ,2]});
  //   arr.splice(pos2, 2);
  // })
  .add('json-crdt StringRga type', function () {
    editStringRga();
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
