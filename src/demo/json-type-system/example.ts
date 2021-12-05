import {JsonTypeSystem} from '../../json-type-system';
import {types} from '../json-type/samples';

// Create a new type system.
const system = new JsonTypeSystem({
  types,
  customValidators: [
    {
      name: 'globalId',
      types: ['string'],
      fn: (id: string) => {
        if (typeof id  !== 'string') throw new Error('id must be string');
        if (id.length > 10) throw new Error('id too long');
      }
    },
  ],
});

// Get type by its ref.
console.log(system.ref('User'));

// Get fast validator of a type.
const userValidator = system.getFastValidator('User');
console.log(userValidator.toString());

// Get and validate a type using full validator.
console.log(system.getFullValidator('User')({
  gid: 'User/123',
  id: 123,
  email: 'test@example.com',
  timeCreated: 123123123,
  timeUpdated: 123123123,
}));

// Convert a type to a JSON Schema.
const schema = system.toJsonSchema('CreateUserResponse');
console.log(JSON.stringify(schema, null, 4));
