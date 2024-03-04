/* tslint:disable no-console */

const i = 10000;
class MySlice {
  constructor(
    public uint8: ArrayBuffer,
    public start: number,
    public end: number,
  ) {}
}

console.time('new Slice()');
for (let i = 0; i < iterations; i++) {
  const buf = new ArrayBuffer(1024 * 4);
  for (let j = 1024; j > 0; j--) {
    new Slice(buf, 0, j);
  }
}
console.timeEnd('new Slice()');

console.time('new Uint8Array()');
for (let i = 0; i < iterations; i++) {
  const buf = new ArrayBuffer(1024 * 4);
  for (let j = 1024; j > 0; j--) {
    new Uint8Array(buf, 0, j);
  }
}
console.timeEnd('new Uint8Array()');

console.time('ArrayBuffer.prototype.resize');
for (let i = 0; i < iterations; i++) {
  const buf = new (ArrayBuffer as any)(1024 * 4, {maxByteLength: 1024 * 4});
  for (let j = 1024; j > 0; j--) {
    buf.resize(j);
  }
}
console.timeEnd('ArrayBuffer.prototype.resize');
