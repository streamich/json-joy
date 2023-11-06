import {definitions, type RouteDefinition} from '../__bench__/routes';
import {Router} from '../router';

const createRouter = (definitions: RouteDefinition[]) => {
  const router = new Router();
  for (const [method, steps] of definitions) {
    const path = steps
      .map((step) => {
        if (typeof step === 'string') return step;
        if (Array.isArray(step)) {
          if (Array.isArray(step[0])) return `{${step[0][0]}::\n}`;
          else return `{${step[0]}}`;
        }
        return '';
      })
      .join('/');
    router.add(`${method} /${path}`, `${method} /${path}`);
  }
  // console.log(router + '')
  return router;
};

test('can execute a PUT /files route', () => {
  const router = createRouter(definitions);
  const matcher = router.compile();
  expect(matcher('PUT /files/bucket/my-file.exe')!.params).toEqual(['bucket', 'my-file.exe']);
});
