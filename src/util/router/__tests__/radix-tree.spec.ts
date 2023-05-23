import {Router} from '../router';

describe('can route and extract params', () => {
  const router = new Router();
  router.add('GET /ping', 'PING');
  router.add('GET /posts/{post}', 'GET_POST');
  router.add('GET /users/{user}', 'GET_USER');
  router.add('GET /users/{user}/preview', 'USER_PREVIEW');
  router.add('GET /users/all/{ids}', 'USERS_ALL');
  // console.log(router + '');
  const matcher = router.compile();
  // console.log(matcher + '');

  const assertMatch = (route: string, data: unknown, params: unknown[]) => {
    const match = matcher(route);
    expect(typeof match).toBe('object');
    expect(match!.data).toEqual(data);
    expect(match!.params).toEqual(params);
  };

  test('can match routes', () => {
    assertMatch('GET /users/123', 'GET_USER', ['123']);
    assertMatch('GET /users/456/preview', 'USER_PREVIEW', ['456']);
    assertMatch('GET /posts/gg', 'GET_POST', ['gg']);
    assertMatch('GET /users/all/1,2,3', 'USERS_ALL', ['1,2,3']);
  });
});
