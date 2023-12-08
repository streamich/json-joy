import {TypeSystem} from '../../../../../json-type';
import {ObjectValue} from '../../../../../json-type-value/ObjectValue';
import {ObjectValueCaller} from '../ObjectValueCaller';

test('can execute simple calls', async () => {
  const system = new TypeSystem();
  const {t} = system;
  const router = ObjectValue.create(system)
    .prop('ping', t.Function(t.any, t.Const(<const>'pong')), async () => 'pong')
    .prop('echo', t.Function(t.any, t.any), async (req) => req);
  const caller = new ObjectValueCaller({router});
  const res1 = await caller.call('ping', null, {});
  expect(res1.data).toBe('pong');
  const res2 = await caller.callSimple('echo', {foo: 'bar'}, {});
  expect(res2).toEqual({foo: 'bar'});
});
