import {randomType} from '../../json-random/randomType';
import {t} from '../../json-type';
import {JsonTypeSystem} from '../../json-type-system';

const types = {
  'Post': t.Object([
    t.Field('id', t.str),
    t.Field('title', t.str),
    t.Field('createdBy', t.str),
    t.Field('createdAt', t.Number({format: 'i'})),
    t.Field('updatedAt', t.num),
    t.Field('isActive', t.bool),
    t.Field('tags', t.Array(t.str), {isOptional: true}),
    t.Field('op', t.Enum(['add', 'test'])),
  ]),
};

test('validates randomly generated data for a type', () => {
  const system = new JsonTypeSystem({types, customValidators: []});
  const randomTypeOptions = {ref: (id: string) => system.ref(id as any)};
  for (const typeName in types) {
    const type = (types as any)[typeName];
    const fastValidator = system.getFastValidator(typeName);
    const fullValidator = system.getFullValidator(typeName);
    for (let i = 0; i < 10; i++) {
      const json = randomType(type, randomTypeOptions);
      console.log(json);
      expect(!!fastValidator(json)).toBe(false);
      expect(!!fullValidator(json)).toBe(false);
    }
  }
});
