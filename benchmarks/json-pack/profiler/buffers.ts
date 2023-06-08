const arr = new ArrayBuffer(1024 * 4);
const uint8 = new Uint8Array(arr);

console.time('loop');
for (let i = 0; i < 1000000; i++) {
  for (let j = 0; j < 1024; j++) {
    // uint8[j] = uint8.byteLength % 255;
    uint8[j] = uint8.length % 255;
    // uint8[j] = arr.byteLength % 255;
  }
}
console.timeEnd('loop');
