import {Router} from '../router';

describe('can route and extract params', () => {
  const router = new Router();
  router.add('GET /events/{lat}-{lng}', 'EVENT_COORDS');
  router.add('GET /events/{id}', 'EVENT');
  router.add('GET /events/{id}/comments', 'EVENT_COMMENTS');
  // console.log(router + '');
  const matcher = router.compile();
  // console.log(matcher + '');

  const assertMatch = (route: string, data: unknown, params: unknown[]) => {
    const match = matcher(route);
    expect(typeof match).toBe('object');
    expect(match!.data).toEqual(data);
    expect(match!.params).toEqual(params);
  };

  test('can match routes which share parameter node', () => {
    assertMatch('GET /events/123', 'EVENT', ['123']);
    assertMatch('GET /events/123/comments', 'EVENT_COMMENTS', ['123']);
    assertMatch('GET /events/123-456', 'EVENT_COORDS', ['123', '456']);
  });
});
