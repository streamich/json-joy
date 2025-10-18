import {ModuleType} from '../../type/classes/ModuleType';
import {ObjValue} from '../ObjValue';

test('can retrieve field as Value', () => {
  const system = new ModuleType();
  const {t} = system;
  const obj = new ObjValue({foo: 'bar'}, t.Object(t.Key('foo', t.str)));
  const foo = obj.get('foo');
  expect(foo.type!.kind()).toBe('str');
  expect(foo.data).toBe('bar');
});

test('can print to string', () => {
  const system = new ModuleType();
  const {t} = system;
  const obj = new ObjValue({foo: 'bar'}, t.Object(t.Key('foo', t.str)));
  expect(obj + '').toMatchSnapshot();
});

describe('.set()', () => {
  test('can set a field', () => {
    const base = ObjValue.new();
    const t = base.system.t;
    const procedure = () => 'pong';
    const router = base.set(
      'ping',
      t.fn
        .io(t.undef, t.str)
        .ctx<{ip: string}>()
        .title('Ping the server')
        .description('Returns "pong" if the server is reachable')
        .value(procedure),
    );
    const value = router.get('ping');
    expect(value.data).toBe(procedure);
    expect(value.type!.req.getSchema()).toEqual(t.undef.getSchema());
    expect(value.type!.res.getSchema()).toEqual(t.str.getSchema());
  });

  test('can set multiple fields', () => {
    const base = ObjValue.new();
    const t = base.system.t;
    const procedure = () => 'pong';
    const router = base
      .set(
        'ping',
        t.fn
          .io(t.undef, t.str)
          .ctx<{ip: string}>()
          .title('Ping the server')
          .description('Returns "pong" if the server is reachable')
          .value(procedure),
      )
      .set(
        'echo',
        t.fn
          .io(t.any, t.any)
          .ctx<{ip: string}>()
          .title('Echo the input')
          .description('Returns the input value unchanged')
          .value((input) => input),
      )
      .set(
        'getUser',
        t.fn
          .input(t.str.title('User ID').description('ID of the user to retrieve'))
          .output(
            t.object({
              id: t.str,
              name: t.str.title('User full name').min(1).max(32),
              friends: t.fn.input(t.str).out(t.str.title('Friend name')),
            }),
          )
          .ctx<{ip: string}>()
          .title('Get user by ID')
          .description('Returns user object with the specified ID')
          .value((id) => ({id, name: 'User ' + id, friends: async (friendId) => 'Friend ' + friendId})),
      );
    expect(router.get('ping').data).toBe(procedure);
    expect(router.get('getUser').type!.req.getSchema()).toEqual(
      t.str.title('User ID').description('ID of the user to retrieve').getSchema(),
    );
    expect(router.get('getUser').type!.res.getSchema()).toEqual(
      t
        .object({
          id: t.str,
          name: t.str.title('User full name').min(1).max(32),
          friends: t.fn.input(t.str).out(t.str.title('Friend name')),
        })
        .getSchema(),
    );
    expect(router.get('echo').type!.req.getSchema()).toEqual(t.any.getSchema());
  });
});
