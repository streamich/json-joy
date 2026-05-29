import {Route, Router, Destination} from '../router';
import {ExactStep, UntilStep} from '../steps';

describe('bug: duplicate placeholder text in a route', () => {
  test('Route.from preserves both occurrences of an identical placeholder', () => {
    const route = Route.from('GET /a/{id}/b/{id}');
    // Expected: ExactStep('GET /a/'), UntilStep('id', '/'), ExactStep('/b/'), UntilStep('id', '/')
    expect(route.steps).toHaveLength(4);
    expect(route.steps[0]).toBeInstanceOf(ExactStep);
    expect((route.steps[0] as ExactStep).text).toBe('GET /a/');
    expect(route.steps[1]).toBeInstanceOf(UntilStep);
    expect((route.steps[1] as UntilStep).name).toBe('id');
    expect((route.steps[1] as UntilStep).until).toBe('/');
    expect(route.steps[2]).toBeInstanceOf(ExactStep);
    expect((route.steps[2] as ExactStep).text).toBe('/b/');
    expect(route.steps[3]).toBeInstanceOf(UntilStep);
    expect((route.steps[3] as UntilStep).name).toBe('id');
    expect((route.steps[3] as UntilStep).until).toBe('/');
  });

  test('Route.from round-trips text for repeated placeholder', () => {
    const route = Route.from('GET /a/{id}/b/{id}');
    expect(route.toText()).toBe('GET /a/{id::/}/b/{id::/}');
  });

  test('matcher routes a request with two same-name params and extracts both', () => {
    const router = new Router();
    router.add('GET /a/{id}/b/{id}', 'DUP');
    const matcher = router.compile();
    const m = matcher('GET /a/111/b/222');
    expect(m).toBeDefined();
    expect(m!.data).toBe('DUP');
    expect(m!.params).toEqual(['111', '222']);
  });
});

describe('bug: defaultUntil is dropped for array-form routes', () => {
  test('Destination.from propagates defaultUntil to every route in an array', () => {
    const dest = Destination.from(['GET |users|{u}', 'POST |users|{u}'], null, '|');
    expect(dest.routes).toHaveLength(2);
    for (const route of dest.routes) {
      const last = route.steps[route.steps.length - 1];
      expect(last).toBeInstanceOf(UntilStep);
      expect((last as UntilStep).until).toBe('|');
    }
  });

  test('Router.options.defaultUntil applies to array-form add()', () => {
    const router = new Router({defaultUntil: '|'});
    router.add(['GET |users|{u}', 'POST |users|{u}'], 'USER');
    const matcher = router.compile();
    // With defaultUntil '|', the {u} param must terminate at '|', so a trailing
    // '|avatar' should not be captured as part of the param and should not match.
    expect(matcher('GET |users|123|avatar')).toBe(undefined);
    expect(matcher('POST |users|123|avatar')).toBe(undefined);
    const m = matcher('GET |users|123');
    expect(m).toBeDefined();
    expect(m!.data).toBe('USER');
    expect(m!.params).toEqual(['123']);
  });
});
