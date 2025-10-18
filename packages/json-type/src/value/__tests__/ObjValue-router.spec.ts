import {createRouter} from './ObjValue.fixtures';

test('can retrieve field as Value', async () => {
  const log = jest.fn();
  const router = createRouter({log});
  const result = await router.fn('log.message').exec({message: 'asdf'});
  expect(result.data).toEqual({time: expect.any(Number)});
});
