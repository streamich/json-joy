const Benchmark = require('benchmark');
const encoder = require('../../es2020/json-pack/util').encoder;
const EncodingPlan = require('../../es2020/json-type-codegen/msgpack').EncodingPlan;
const t = require('../../es2020/json-type/type').t;

const type = t.Object({
  fields: [
    t.Field('collection', t.Object({
      fields: [
        t.Field('id', t.str),
        t.Field('ts', t.num),
        t.Field('cid', t.str),
        t.Field('prid', t.str),
        t.Field('slug', t.str),
        t.Field('name', t.str, {isOptional: true}),
        t.Field('src', t.str, {isOptional: true}),
        t.Field('doc', t.str, {isOptional: true}),
        t.Field('authz', t.str, {isOptional: true}),
      ],
    })),
    t.Field('block', t.Object({
      fields: [
        t.Field('id', t.str),
        t.Field('ts', t.num),
        t.Field('cid', t.str),
        t.Field('slug', t.str),
      ],
    })),
  ],
});

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
  },
  block: {
    id: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    ts: Date.now(),
    cid: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    slug: 'slug-name',
  },
};

const plan = new EncodingPlan();
plan.createPlan(type);
const js = plan.codegen();
const fn = eval(js)(encoder);

const suite = new Benchmark.Suite;

suite
  .add(`json-joy/json-type-codegen`, function() {
    fn(json);
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
