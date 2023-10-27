/**
 * npx ts-node src/json-crdt/__bench__/bench.random.ts
 */

const iter = 1000e6;

let sum = 0;
const iteration = () => (sum += Math.random());

const t1 = performance.now();
for (let i = 0; i < iter; i++) iteration();
const t2 = performance.now();

// tslint:disable-next-line no-console
console.log('Result:', sum, 'Ops/sec:', (iter / ((t2 - t1) / 1000) / 1e6).toFixed(1), 'M');
// Result: 500002092.3119511 Ops/sec: 96.7 M
