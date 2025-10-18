import type {TypeOf} from '../../../schema';
import type {SchemaOf, TypeOfAlias} from '../../types';
import {ModuleType} from '../ModuleType';

test('can infer alias type', () => {
  const system = new ModuleType();
  const {t} = system;
  const user = system.alias('User', t.Object(t.Key('id', t.str), t.KeyOpt('name', t.str)));
  type T = TypeOf<SchemaOf<TypeOfAlias<typeof user>>>;
  const _value: T = {
    id: 'string',
  };
});
