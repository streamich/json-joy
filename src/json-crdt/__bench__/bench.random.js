'use strict';

/**
 * node benchmarks/json-crdt/bench.random.js
 */

const iterations = 1000e6;

var sum = 0;
const iteration = () => (sum += Math.random());

const t1 = performance.now();
for (let i = 0; i < iterations; i++) iteration();
const t2 = performance.now();

console.log('Result:', sum, 'Ops/sec:', (iterations / ((t2 - t1) / 1000) / 1e6).toFixed(1), 'M');
// Result: 500002092.3119511 Ops/sec: 96.7 M
