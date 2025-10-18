import {ModuleType} from '../../type/classes/ModuleType';
import {aliasToJsonSchema} from '../converter';

test('can export recursive schema', () => {
  const system = new ModuleType();
  const {t} = system;
  const post = system.alias('Post', t.Object(t.Key('id', t.str), t.KeyOpt('author', t.Ref('User'))));
  system.alias('Stream', t.Object(t.Key('id', t.str), t.Key('posts', t.Array(t.Ref('Post')))));
  system.alias('User', t.Object(t.Key('id', t.str), t.Key('name', t.str), t.Key('following', t.Ref('Stream'))));
  const schema = aliasToJsonSchema(post);
  expect(schema.$ref).toBe('#/$defs/Post');
  expect(typeof schema.$defs?.Post).toBe('object');
  expect(typeof schema.$defs?.Stream).toBe('object');
  expect(typeof schema.$defs?.User).toBe('object');
});
