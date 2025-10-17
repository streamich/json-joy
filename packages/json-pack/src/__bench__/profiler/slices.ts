/* tslint:disable no-console */

const iterations = 10000000;
const buf = new ArrayBuffer(1024 * 4);
const arr = new Uint8Array(buf);
const arr2 = Buffer.from(buf);
const arr3 = Buffer.allocUnsafe(1024 * 4);
const FastBuffer = (Buffer as any)[Symbol.species] as any;

class Slice {
  constructor(
    public uint8: ArrayBuffer,
    public start: number,
    public end: number,
  ) {}
}

const res = {
  end: (() => {}) as any,
};

console.time('res.end(buf, offset, length)');
for (let i = 0; i < iterations; i++) {
  const pos = i % 1024;
  res.end(buf, pos, pos + 1);
}
console.timeEnd('res.end(buf, offset, length)');

console.time('new Slice()');
for (let i = 0; i < iterations; i++) {
  const pos = i % 1024;
  res.end(new Slice(buf, pos, pos + 1));
}
console.timeEnd('new Slice()');

console.time('new FastBuffer()');
for (let i = 0; i < iterations; i++) {
  const pos = i % 1024;
  res.end(new FastBuffer(buf, pos, 1));
}
console.timeEnd('new FastBuffer()');

console.time('new Uint8Array()');
for (let i = 0; i < iterations; i++) {
  const pos = i % 1024;
  res.end(new Uint8Array(buf, pos, 1));
}
console.timeEnd('new Uint8Array()');

console.time('Uint8Array.prototype.subarray()');
for (let i = 0; i < iterations; i++) {
  const pos = i % 1024;
  res.end(arr.subarray(pos, pos + 1));
}
console.timeEnd('Uint8Array.prototype.subarray()');

console.time('Buffer.prototype.subarray()');
for (let i = 0; i < iterations; i++) {
  const pos = i % 1024;
  res.end(arr2.subarray(pos, pos + 1));
}
console.timeEnd('Buffer.prototype.subarray()');

console.time('Buffer.prototype.subarray() - 2');
for (let i = 0; i < iterations; i++) {
  const pos = i % 1024;
  res.end(arr3.subarray(pos, pos + 1));
}
console.timeEnd('Buffer.prototype.subarray() - 2');
