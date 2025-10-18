/**
 * Run with:
 *
 *     npx nodemon -q -x npx ts-node src/json-type/__demos__/json-type.ts
 */

/* tslint:disable no-console */

import {EncodingFormat} from '@jsonjoy.com/json-pack/lib/constants';
import {TypeSystem} from '../../json-type';

console.clear();

const system = new TypeSystem();
const {t} = system;

const type = t
  .Object(
    t.prop('id', t.str.options({ascii: true, min: 40, max: 80})).options({title: 'Every object has an ID'}),
    t.propOpt('name', t.str),
    t.prop('age', t.num.options({format: 'u8', gt: 16, lt: 100})),
    t.prop('verified', t.bool),
    t.prop('sex', t.Or(t.Const(<const>'male'), t.Const(<const>'female'), t.Const(<const>'other'), t.Const<null>(null))),
  )
  .options({
    title: 'My object',
  });

console.log();
console.log('Print to string:');
console.log();
console.log(type + '');

console.log();
console.log('Generate random value:');
console.log();
console.log(type.random());

console.log();
console.log('Can output JSON Type schema:');
console.log();
console.log(type.getSchema());

console.log();
console.log('Can output JSON Schema schema:');
console.log();
console.log(type.toJsonSchema());

console.log();
console.log('Can export and import the schema:');
const type2 = t.import(type.getSchema());
console.log();
console.log(type2 + '');

console.log();

console.log('Can validate the schema.');
type2.validateSchema();

console.log('Can validate data.');
type2.validate({
  id: '1234567890123456789012345678901234567890',
  name: 'John Doe',
  age: 18,
  verified: true,
  sex: 'male',
});

console.log();
console.log('Can serialize value to JSON:');
console.log();
console.log(
  type2.toJson({
    id: '1234567890123456789012345678901234567890',
    name: 'John Doe',
    age: 18,
    verified: true,
    sex: 'male',
  }),
);

console.log();
console.log('Can create a JSON Type schema out of a sample object:');
const sample = {
  id: '1234567890123456789012345678901234567890',
  name: 'John Doe',
  age: 18,
};
const user = system.alias('User', t.from(sample));
console.log();
console.log(sample);
console.log();
console.log(user.type + '');

console.log();
console.log('Can generate TypeScript types for a schema:');
console.log();
console.log(user.toTypeScriptAst());
console.log();
console.log(user.toTypeScript());

console.log();
console.log('Can compile a fast JSON serializer:');
console.log();
console.log(user.type.compileEncoder(EncodingFormat.Json).toString());

console.log();
console.log('Can compile a fast CBOR serializer:');
console.log();
console.log(user.type.compileCborEncoder({system}).toString());

console.log();
console.log('Can compile a fast MessagePack serializer:');
console.log();
console.log(user.type.compileMessagePackEncoder({system}).toString());

console.log();
console.log('Can compile a fast validator, which returns booleans as errors:');
console.log();
const validator = user.type.compileValidator({
  errors: 'boolean',
  skipObjectExtraKeysCheck: true,
});
console.log(validator.toString());

console.log();
console.log('Can compile a fast validator, which returns JSON strings as errors:');
console.log();
const validator2 = user.type.compileValidator({
  errors: 'string',
  skipObjectExtraKeysCheck: true,
});
console.log(validator2.toString());

console.log();
console.log('Can compile a fast validator, which returns objects as errors:');
console.log();
const validator3 = user.type.compileValidator({
  errors: 'object',
  skipObjectExtraKeysCheck: true,
});
console.log(validator3.toString());
