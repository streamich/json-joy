/* tslint:disable no-console */

/**
 * Run this demo with:
 *
 *     npx ts-node src/demo/json-type-system.ts
 */

import {JsonTypeSystem} from '../json-type-system';
import {toText} from '../json-type-typescript/toText';
import {types, customValidators} from './json-type/samples';

// Create a new type system.
const system = new JsonTypeSystem({
  types,
  customValidators,
});

// Get type by its ref.
console.log(system.ref('User'));

// Get fast validator of a type.
const userValidator = system.getFastValidator('User');
console.log(userValidator.toString());

// Get and validate a type using full validator.
console.log(
  system.getFullValidator('User')({
    gid: 'User/123',
    id: 123,
    email: 'test@example.com',
    timeCreated: 123123123,
    timeUpdated: 123123123,
  }),
);

// Convert a type to a JSON Schema.
const schema = system.toJsonSchema('CreateUserResponse', false);
console.log(JSON.stringify(schema, null, 4));

// const declarations = system.exportTypeAndRefTsDeclarations('CreateUserResponse');
const declarations1 = system.toTsAst('pubsub.channel.Channel');
console.log(JSON.stringify(declarations1, null, 4));

const declarations2 = system.toTsAst();
console.log(toText(declarations2));
