const Benchmark = require('benchmark');
const {encoderFull, decoder} = require('../../es2020/json-pack/msgpack/util');
const {Model} = require('../../es2020/json-crdt');
const {clone} = require('../../es2020/json-clone');
const {Encoder: EncoderBinary} = require('../../es2020/json-crdt/codec/structural/binary/Encoder');
const {Decoder: DecoderBinary} = require('../../es2020/json-crdt/codec/structural/binary/Decoder');
const {Encoder: EncoderCompactBinary} = require('../../es2020/json-crdt/codec/structural/compact-binary/Encoder');
const {Decoder: DecoderCompactBinary} = require('../../es2020/json-crdt/codec/structural/compact-binary/Decoder');
const {ViewDecoder: ViewDecoderBinary} = require('../../es2020/json-crdt/codec/structural/binary/ViewDecoder');
const {Encoder: EncoderCompact} = require('../../es2020/json-crdt/codec/structural/compact/Encoder');
const {Decoder: DecoderCompact} = require('../../es2020/json-crdt/codec/structural/compact/Decoder');
const {Encoder: EncoderJson} = require('../../es2020/json-crdt/codec/structural/json/Encoder');
const {Decoder: DecoderJson} = require('../../es2020/json-crdt/codec/structural/json/Decoder');
const {deepEqual} = require('../../es2020/json-equal/deepEqual');
const zlib = require('zlib');
const Automerge = require('automerge');
const Y = require('yjs');
const selected = require('../data/json2');

const jsonToYjsType = (json) => {
  if (!json) return json;
  if (typeof json === 'object') {
    if (Array.isArray(json)) {
      const arr = new Y.Array();
      arr.push(json.map(jsonToYjsType));
      return arr;
    }
    const obj = new Y.Map();
    for (const [key, value] of Object.entries(json)) obj.set(key, jsonToYjsType(value));
    return obj;
  }
  return json;
};

const model = Model.withServerClock();
model.api.root(selected);
const encoderBinary = new EncoderBinary();
const decoderBinary = new DecoderBinary();
const viewDecoderBinary = new ViewDecoderBinary();
const encoderCompactBinary = new EncoderCompactBinary();
const decoderCompactBinary = new DecoderCompactBinary();
const encoderCompact = new EncoderCompact();
const decoderCompact = new DecoderCompact();
const encoderJson = new EncoderJson();
const decoderJson = new DecoderJson();

let automerge = Automerge.init();
automerge = Automerge.change(automerge, (doc) => {
  doc.a = selected;
});

const strategies = [];

strategies.push({
  name: 'JSON.stringify()',
  encode: (json) => {
    return JSON.stringify(clone(json));
  },
  decode: (buf) => {
    return JSON.parse(buf);
  },
});

strategies.push({
  name: 'MessagePack',
  encode: (json) => {
    return encoderFull.encode(clone(json));
  },
  decode: (buf) => {
    return decoder.decode(buf);
  },
});

strategies.push({
  name: 'JSON CRDT (server clock) + binary codec with view decoder',
  encode: (json) => {
    const model = Model.withServerClock();
    model.api.root(json);
    const buf = encoderBinary.encode(model);
    return buf;
  },
  decode: (buf) => {
    return viewDecoderBinary.decode(buf);
  },
});

strategies.push({
  name: 'JSON CRDT (server clock) + binary codec',
  encode: (json) => {
    const model = Model.withServerClock();
    model.api.root(json);
    const buf = encoderBinary.encode(model);
    return buf;
  },
  decode: (buf) => {
    const model = decoderBinary.decode(buf);
    return model.view();
  },
});

strategies.push({
  name: 'JSON CRDT (server clock) + compact-binary codec',
  encode: (json) => {
    const model = Model.withServerClock();
    model.api.root(json);
    const buf = encoderCompactBinary.encode(model);
    return buf;
  },
  decode: (buf) => {
    const model = decoderCompactBinary.decode(buf);
    return model.view();
  },
});

strategies.push({
  name: 'JSON CRDT (server clock) + compact codec',
  encode: (json) => {
    const model = Model.withServerClock();
    model.api.root(json);
    const res = encoderCompact.encode(model);
    return JSON.stringify(res);
  },
  decode: (buf) => {
    const model = decoderCompact.decode(JSON.parse(buf));
    return model.view();
  },
});

strategies.push({
  name: 'JSON CRDT (server clock) + json codec',
  encode: (json) => {
    const model = Model.withServerClock();
    model.api.root(json);
    const res = encoderJson.encode(model);
    return JSON.stringify(res);
  },
  decode: (buf) => {
    const model = decoderJson.decode(JSON.parse(buf));
    return model.view();
  },
});

strategies.push({
  name: 'Y.js',
  encode: (json) => {
    const ydoc = new Y.Doc();
    const ymap = ydoc.getMap();
    ymap.set('a', jsonToYjsType(json));
    const buf = Y.encodeStateAsUpdate(ydoc);
    return buf;
  },
  decode: (buf) => {
    const ydoc = new Y.Doc();
    Y.applyUpdate(ydoc, buf);
    return ydoc.getMap().get('a').toJSON();
  },
});

strategies.push({
  name: 'Automerge',
  encode: (json) => {
    let automerge = Automerge.init();
    automerge = Automerge.change(automerge, (doc) => {
      doc.a = json;
    });
    return Automerge.save(automerge);
  },
  decode: (buf) => {
    const automerge = Automerge.load(buf);
    return automerge.a;
  },
});

strategies.push({
  name: 'JSON CRDT (server clock) + binary codec + zlib.deflateSync',
  encode: (json) => {
    const model = Model.withServerClock();
    model.api.root(json);
    const buf = encoderBinary.encode(model);
    return zlib.deflateRawSync(buf);
  },
  decode: (buf) => {
    const model = decoderBinary.decode(zlib.inflateRawSync(buf));
    return model.view();
  },
});

const pako = require('pako');
strategies.push({
  name: 'JSON CRDT (server clock) + binary codec + pako',
  encode: (json) => {
    const model = Model.withServerClock();
    model.api.root(json);
    const buf = encoderBinary.encode(model);
    return pako.deflate(buf);
  },
  decode: (buf) => {
    const model = decoderBinary.decode(pako.inflate(buf));
    return model.view();
  },
});

strategies.push({
  name: 'JSON.stringify() + zlib.deflateSync',
  encode: (json) => {
    return zlib.deflateRawSync(JSON.stringify(clone(json)));
  },
  decode: (buf) => {
    return JSON.parse(zlib.inflateRawSync(buf));
  },
});

strategies.push({
  name: 'MessagePack',
  encode: (json) => {
    return zlib.deflateRawSync(encoderFull.encode(clone(json)));
  },
  decode: (buf) => {
    return decoder.decode(zlib.inflateRawSync(buf));
  },
});

console.log('Sizes:');

const suite = new Benchmark.Suite();
for (const strategy of strategies) {
  const encode = strategy.encode;
  const encoded = (strategy.encoded = encode(selected));
  const decoded = strategy.decode(encoded);
  const areEqual = deepEqual(selected, decoded);
  console.log(
    `${strategy.name}: ${Buffer.isBuffer(encoded) ? encoded.length : Buffer.from(encoded).length} bytes (${
      areEqual ? '✅' : '❌'
    })`,
  );
  if (!areEqual) {
    console.log('Decoding error:');
    console.log(decoded);
    console.log(selected);
  }
  suite.add(strategy.name, function () {
    encode(selected);
  });
}

/*
console.log('');
console.log('Encode and Decode:');

const suite3 = new Benchmark.Suite;
for (const strategy of strategies) {
  const encode = strategy.encode;
  const decode = strategy.decode;
  suite3
    .add(strategy.name, function() {
      decode(encode(selected));
    });
}

suite3
  .on('cycle', function(event) {
    console.log(String(event.target));
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run();
*/

console.log('');
console.log('Encode:');

suite
  .on('cycle', function (event) {
    console.log(String(event.target));
  })
  .on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run();

console.log('');
console.log('Decode:');

const suite2 = new Benchmark.Suite();
for (const strategy of strategies) {
  const decode = strategy.decode;
  const encoded = strategy.encoded;
  suite2.add(strategy.name, function () {
    decode(encoded);
  });
}

suite2
  .on('cycle', function (event) {
    console.log(String(event.target));
  })
  .on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run();
