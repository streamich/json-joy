import {Router} from '../router';

describe('can route and extract params', () => {
  const router = new Router();
  router.add('GET /files/{path::\n}', 'FILE');
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
    assertMatch('GET /files/blob.bin', 'FILE', ['blob.bin']);
    assertMatch('GET /files/folder/pics/photo.jpeg', 'FILE', ['folder/pics/photo.jpeg']);
  });
});
