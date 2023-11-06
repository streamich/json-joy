import {TypeSystem} from '../../system/TypeSystem';

test('can use builder with type system wired in', () => {
  const system = new TypeSystem();
  const t = system.t;
  system.alias('User', t.Object(t.prop('id', t.str)));
  const ref = t.Ref('User');
  const json = ref.toJson({id: '123'});
  expect(json).toBe('{"id":"123"}');
});
