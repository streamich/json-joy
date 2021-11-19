const Benchmark = require('benchmark');
const Ajv = require("ajv")

const ajv = new Ajv() // options can be passed, e.g. {allErrors: true}

const schema = {
  type: "object",
  properties: {
    collection: {
      type: "object",
      properties: {
        id: {type: "string"},
        ts: {type: "number"},
        cid: {type: "string"},
        prid: {type: "string"},
        slug: {type: "string"},
        name: {type: "string"},
        src: {type: "string"},
        authz: {type: "string"},
      },
      required: ["id", "ts", "cid", "prid"],
      additionalProperties: false,
    },
  },
  required: ["collection"],
  additionalProperties: false,
}

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
};

const validate = ajv.compile(schema);
const suite = new Benchmark.Suite;

suite
  .add(`ajv`, function() {
    validate(json)
  })
  .on('cycle', function(event) {
    console.log(String(event.target) + `, ${Math.round(1000000000 / event.target.hz)} ns/op`);
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run();
