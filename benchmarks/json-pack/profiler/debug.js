// node --print-code benchmarks/json-pack/profiler/debug.js
// node --print-bytecode benchmarks/json-pack/profiler/debug.js
// node --allow-natives-syntax benchmarks/json-pack/profiler/debug.js
// NODE_ENV=production node --prof benchmarks/json-pack/profiler/debug.js
// node --prof-process isolate-0xnnnnnnnnnnnn-v8.log

const json1 = require('../../data/json1');
const {MsgPackEncoderFast} = require('../../../es2020/json-pack/msgpack/MsgPackEncoderFast');

const encoder = new MsgPackEncoderFast();

for (let i = 0; i < 10000000; i++) {
  const buf = encoder.encode(json1);
}

// %DebugPrint(buf);
