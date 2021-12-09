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

  'Integers': t.Object([
    t.Field('i8', t.Number({format: 'i8'})),
    t.Field('i16', t.Number({format: 'i16'})),
    t.Field('i32', t.Number({format: 'i32'})),
    t.Field('i64', t.Number({format: 'i64'})),
    t.Field('u8', t.Number({format: 'u8'})),
    t.Field('u16', t.Number({format: 'u16'})),
    t.Field('u32', t.Number({format: 'u32'})),
    t.Field('u64', t.Number({format: 'u64'})),
  ]),

  'BasicTypes': t.Object([
    t.Field('boolean', t.bool),
    t.Field('null', t.nil),
    t.Field('number', t.num),
    t.Field('string', t.str),
    t.Field('object', t.obj),
    t.Field('array', t.arr),
  ]),

  Literals: t.Object([
    t.Field('true', t.Boolean({const: true})),
    t.Field('false', t.Boolean({const: false})),
    t.Field('str1', t.String({const: ''})),
    t.Field('str2', t.String({const: 'adsf'})),
    t.Field('num1', t.Number({const: 0})),
    t.Field('num2', t.Number({const: 123})),
  ]),

  CreatePostResponse: t.Object([
    t.Field('post', t.Ref('Post')),
  ]),

  'User': t.Object([
    t.Field('id', t.num),
    t.Field('name', t.str, {isOptional: true}),
    t.Field('friend', t.Ref('User'), {isOptional: true}),
  ]),
};

test('validates randomly generated data for a type', () => {
  const system = new JsonTypeSystem({types, customValidators: []});
  const randomTypeOptions = {ref: (id: string) => system.ref(id as any)};
  for (const typeName in types) {
    const type = (types as any)[typeName];
    const fastValidator = system.getFastValidator(typeName);
    const fullValidator = system.getFullValidator(typeName);
    for (let i = 0; i < 100; i++) {
      const json = randomType(type, randomTypeOptions);
      // console.log(json);
      expect(!!fastValidator(json)).toBe(false);
      expect(!!fullValidator(json)).toBe(false);
    }
  }
});
