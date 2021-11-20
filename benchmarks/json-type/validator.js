const Benchmark = require('benchmark');
const Ajv = require("ajv")
const Schemasafe = require('@exodus/schemasafe');
const JsonTypeValidatorCodegen = require('../../es2020/json-type-codegen/validator').JsonTypeValidatorCodegen;
const t = require('../../es2020/json-type/type').t;

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

const type = t.Object({
  unknownFields: false,
  fields: [
    t.Field('collection', t.Object({
      unknownFields: false,
      fields: [
        t.Field('id', t.str),
        t.Field('ts', t.num),
        t.Field('cid', t.str),
        t.Field('prid', t.str),
        t.Field('slug', t.str, {isOptional: true}),
        t.Field('name', t.str, {isOptional: true}),
        t.Field('src', t.str, {isOptional: true}),
        t.Field('authz', t.str, {isOptional: true}),
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
};

const jsonType = new JsonTypeValidatorCodegen();
const jsonTypeValidator = eval(jsonType.codegen(type));

const jsonType2 = new JsonTypeValidatorCodegen({skipObjectExtraFieldsCheck: true});
const jsonTypeValidator2 = eval(jsonType2.codegen(type));

const fastestHandcraftedValidator = (function(r0) {
  var r1 = r0;
  if (typeof r1 !== 'object' || !r1) return true;
  var r3 = 0; for (var r2 in r1) r3++; if (r3 !== 1) return true;
  var r5 = r1.collection;
  if (typeof r5 !== 'object' || !r5) return true;
  var r7 = 0; for (var r6 in r5) r7++; if (r7 !== 8) return true;
  if (typeof r5.id !== "string") return true;
  if (typeof r5.ts !== "number") return true;
  if (typeof r5.cid !== "string") return true;
  if (typeof r5.prid !== "string") return true;
  var r12 = r5.slug;
  if (r12 !== undefined) {
    if (typeof r12 !== "string") return true;
  }
  var r13 = r5.name;
  if (r13 !== undefined) {
    if (typeof r13 !== "string") return true;
  }
  var r14 = r5.src;
  if (r14 !== undefined) {
    if (typeof r14 !== "string") return true;
  }
  var r15 = r5.authz;
  if (r15 !== undefined) {
    if (typeof r15 !== "string") return true;
  }
  return false;
});

const ajv = new Ajv();
const ajvValidator = ajv.compile(schema);

const schemasafeValidator = Schemasafe.validator(schema);

// console.log(jsonTypeValidator.toString());
// console.log(ajvValidator.toString());
// console.log(schemasafeValidator.toString());

const suite = new Benchmark.Suite;

suite
  .add(`[fastest handcrafted validator]`, function() {
    fastestHandcraftedValidator(json);
  })
  .add(`json-joy/json-type-codegen`, function() {
    jsonTypeValidator(json);
  })
  .add(`json-joy/json-type-codegen (extra fields check skipped)`, function() {
    jsonTypeValidator2(json);
  })
  .add(`ajv`, function() {
    ajvValidator(json);
  })
  .add(`@exodus/schemasafe`, function() {
    schemasafeValidator(json);
  })
  .on('cycle', function(event) {
    console.log(String(event.target) + `, ${Math.round(1000000000 / event.target.hz)} ns/op`);
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run();

