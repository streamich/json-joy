/**
 * NODE_ENV=production node --prof benchmarks/json-crdt/profiler/serialization.js
 * node --prof-process isolate-0xnnnnnnnnnnnn-v8.log
 */

const {Model} = require('../../../lib/json-crdt');
const json = require('../../data/json6');

const doc1 = Model.create();
const doc2 = Model.withServerClock();

doc1.api.root(json);
doc2.api.root(json);

const iterations = 10000;

for (let j = 0; j < 10; j++) {
  console.time('logical');
  for (let i = 0; i < iterations; i++) doc1.toBinary();
  console.timeEnd('logical');

  // console.time('server');
  // for (let i = 0; i < iterations; i++) doc2.toBinary();
  // console.timeEnd('server');
}
