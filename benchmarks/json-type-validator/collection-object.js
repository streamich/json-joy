const Benchmark = require('benchmark');
const Ajv = require("ajv")
const Schemasafe = require('@exodus/schemasafe');
const createBoolValidator = require('../../es2020/json-type-validator').createBoolValidator;
const t = require('../../es2020/json-type').t;

const unknownFields = false;

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
      additionalProperties: unknownFields,
    },
  },
  required: ["collection"],
  additionalProperties: unknownFields,
}

const type = t.Object({
  unknownFields,
  fields: [
    t.Field('collection', t.Object({
      unknownFields,
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

const jsonWithError = {
  collection: {
    id: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    ts: Date.now(),
    cid: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    prid: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    slug: 'slug-name',
    name: 'Super collection',
    src: 666,
    authz: 'export const (ctx) => ctx.userId === "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx";',
  },
};

const fastestHandcraftedValidator = (function(r0) {
  var r1 = r0;
  if (typeof r1 !== 'object' || !r1) return true;
  // var r3 = 0; for (var r2 in r1) r3++; if (r3 !== 1) return true;
  var r5 = r1.collection;
  if (typeof r5 !== 'object' || !r5) return true;
  // var r7 = 0; for (var r6 in r5) r7++; if (r7 !== 8) return true;
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

const jsonTypeValidator1 = createBoolValidator(type, {});
const jsonTypeValidator2 = createBoolValidator(type, {skipObjectExtraFieldsCheck: true});
const jsonTypeValidator3 = createBoolValidator(type, {skipObjectExtraFieldsCheck: true, unsafeMode: true});

const ajv = new Ajv();
const ajvValidator = ajv.compile(schema);

const schemasafeValidator = Schemasafe.validator(schema);

// console.log(jsonTypeValidator1.toString());
// console.log(jsonTypeValidator2.toString());
// console.log(jsonTypeValidator3.toString());
// console.log(ajvValidator.toString());
// console.log(schemasafeValidator.toString());

const validators = [
  {
    name: '[fastest handcrafted validator with no additional properties check]',
    validate: (json) => !fastestHandcraftedValidator(json),
  },
  {
    name: 'json-joy/json-type-codegen',
    validate: (json) => !jsonTypeValidator1(json),
  },
  {
    name: 'json-joy/json-type-codegen {skipObjectExtraFieldsCheck: true}',
    validate: (json) => !jsonTypeValidator2(json),
  },
  {
    name: 'json-joy/json-type-codegen {skipObjectExtraFieldsCheck: true, unsafeMode: true}',
    validate: (json) => !jsonTypeValidator3(json),
  },
  {
    name: 'ajv',
    validate: (json) => ajvValidator(json),
  },
  {
    name: '@exodus/schemasafe',
    validate: (json) => schemasafeValidator(json),
  },
];

const suite = new Benchmark.Suite;

for (const validator of validators) {
  suite.add(validator.name, function() {
    let isValid = validator.validate(json);
    if (!isValid) throw new Error('should be valid');
    isValid = validator.validate(jsonWithError);
    if (isValid) throw new Error('should be invalid');
  })
}

suite
  .on('cycle', function(event) {
    console.log(String(event.target) + `, ${Math.round(1000000000 / event.target.hz)} ns/op`);
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run();

