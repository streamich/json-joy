const Benchmark = require('benchmark');
const encoder = require('../../es2020/json-pack/util').encoder;
const MsgPackSerializerCodegen = require('../../es2020/json-type-serializer').MsgPackSerializerCodegen;
const JsonSerializerCodegen = require('../../es2020/json-type-serializer').JsonSerializerCodegen;
const t = require('../../es2020/json-type').t;

const type = t.Object([
  t.Field('collection', t.Object([
    t.Field('id', t.String({format: 'ascii', noJsonEscape: true})),
    t.Field('ts', t.num),
    t.Field('cid', t.String({format: 'ascii', noJsonEscape: true})),
    t.Field('prid', t.String({format: 'ascii', noJsonEscape: true})),
    t.Field('slug', t.String({format: 'ascii', noJsonEscape: true})),
    t.Field('name', t.str, {isOptional: true}),
    t.Field('src', t.str, {isOptional: true}),
    t.Field('doc', t.str, {isOptional: true}),
    t.Field('authz', t.str, {isOptional: true}),
    t.Field('active', t.bool),
  ])),
  t.Field('block', t.Object([
    t.Field('id', t.String({format: 'ascii', noJsonEscape: true})),
    t.Field('ts', t.num),
    t.Field('cid', t.String({format: 'ascii', noJsonEscape: true})),
    t.Field('slug', t.String({format: 'ascii', noJsonEscape: true})),
  ])),
]);

const json = {
  collection: {
    id: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    ts: Date.now(),
    cid: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    prid: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    slug: 'slug-name',
    name: 'Super collection',
    src: '{"foo": "bar"}',
    authz: 'export const (ctx) => ctx.userId === "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx";',
    active: true,
  },
  block: {
    id: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    ts: Date.now(),
    cid: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    slug: 'slug-name',
  },
};

const msgPackCodegen = new MsgPackSerializerCodegen({encoder});
const serializeMsgpack = msgPackCodegen.compile(type);

const jsonCodegen = new JsonSerializerCodegen({type});
const serializeJson = jsonCodegen.run().compile();

const suite = new Benchmark.Suite;

suite
  .add(`json-joy/json-type-serializer MsgPackSerializerCodegen`, function() {
    serializeMsgpack(json);
  })
  .add(`json-joy/json-type-serializer JsonSerializerCodegen`, function() {
    serializeJson(json);
  })
  .add(`json-joy/json-pack`, function() {
    encoder.encode(json);
  })
  .add(`JSON.stringify()`, function() {
    JSON.stringify(json);
  })
  .on('cycle', function(event) {
    console.log(String(event.target) + `, ${Math.round(1000000000 / event.target.hz)} ns/op`);
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run();
