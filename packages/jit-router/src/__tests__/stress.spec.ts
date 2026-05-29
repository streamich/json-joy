import {Router} from '../router';
import {ExactStep, RegexStep, UntilStep} from '../steps';
import type {Step} from '../types';

const mulberry32 = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const randInt = (rand: () => number, min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;

const pick = <T>(rand: () => number, arr: T[]): T => arr[Math.floor(rand() * arr.length)];

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz';
const ALNUM = ALPHABET + '0123456789';

const randomToken = (rand: () => number, minLen: number, maxLen: number) => {
  const len = randInt(rand, minLen, maxLen);
  let s = '';
  for (let i = 0; i < len; i++) s += ALNUM[Math.floor(rand() * ALNUM.length)];
  return s;
};

const naiveMatch = (steps: Step[], input: string): {params: string[]} | undefined => {
  const params: string[] = [];
  let i = 0;
  const len = steps.length;
  for (let s = 0; s < len; s++) {
    const step = steps[s];
    if (step instanceof ExactStep) {
      if (input.substr(i, step.text.length) !== step.text) return undefined;
      i += step.text.length;
    } else if (step instanceof UntilStep) {
      const isLast = s === len - 1;
      let j: number;
      if (step.until === '\n') {
        j = input.length;
      } else {
        j = input.indexOf(step.until, i);
        if (j === -1) {
          if (isLast) j = input.length;
          else return undefined;
        }
      }
      if (j <= i) return undefined;
      if (step.name) params.push(input.slice(i, j));
      i = j;
    } else if (step instanceof RegexStep) {
      const isLast = s === len - 1;
      const slice = input.slice(i);
      const re = new RegExp('^' + step.regex + step.until + (isLast ? '$' : ''));
      const m = slice.match(re);
      if (!m) return undefined;
      const val = m[1] || m[0];
      if (step.name) params.push(val);
      i += val.length;
    } else {
      return undefined;
    }
  }
  if (i !== input.length) return undefined;
  return {params};
};

describe('stress: many static routes', () => {
  const N = 500;
  const router = new Router<number>();
  const routes: string[] = [];
  for (let i = 0; i < N; i++) {
    const route = `GET /resource-${i}/leaf/path${i % 7}/${(i * 13) % 17}`;
    router.add(route, i);
    routes.push(route);
  }
  const matcher = router.compile();

  test(`matches all ${N} static routes correctly`, () => {
    for (let i = 0; i < N; i++) {
      const m = matcher(routes[i]);
      expect(m).toBeDefined();
      expect(m!.data).toBe(i);
      expect(m!.params || []).toEqual([]);
    }
  });

  test('returns undefined for slightly mutated non-existing routes', () => {
    expect(matcher('GET /resource-9999/leaf/path0/0')).toBe(undefined);
    expect(matcher('GET /resource-1/leaf/path0/0/extra')).toBe(undefined);
    expect(matcher('')).toBe(undefined);
    expect(matcher('GET ')).toBe(undefined);
    expect(matcher('POST /resource-1/leaf/path1/3')).toBe(undefined);
  });

  test('repeated calls produce consistent results', () => {
    for (let pass = 0; pass < 5; pass++) {
      for (let i = 0; i < 50; i++) {
        const idx = (i * 37) % N;
        const m = matcher(routes[idx]);
        expect(m!.data).toBe(idx);
      }
    }
  });
});

describe('stress: many dynamic single-param routes', () => {
  const N = 200;
  const router = new Router<string>();
  for (let i = 0; i < N; i++) {
    router.add(`GET /entity-${i}/{id}/detail`, `E${i}`);
  }
  const matcher = router.compile();

  test('extracts param correctly for each route', () => {
    for (let i = 0; i < N; i++) {
      const id = `id-${i * 31}`;
      const m = matcher(`GET /entity-${i}/${id}/detail`);
      expect(m).toBeDefined();
      expect(m!.data).toBe(`E${i}`);
      expect(m!.params).toEqual([id]);
    }
  });

  test('rejects when terminator missing', () => {
    expect(matcher('GET /entity-5/abc')).toBe(undefined);
    expect(matcher('GET /entity-5//detail')).toBe(undefined);
  });
});

describe('stress: deep parametrized routes', () => {
  const DEPTH = 20;
  const router = new Router<string>();
  let pattern = 'GET ';
  for (let d = 0; d < DEPTH; d++) pattern += `/seg${d}/{p${d}}`;
  router.add(pattern, 'DEEP');
  const matcher = router.compile();

  test(`matches a depth-${DEPTH} route and extracts all params in order`, () => {
    let input = 'GET ';
    const expectedParams: string[] = [];
    for (let d = 0; d < DEPTH; d++) {
      const val = `v${d}x${d * d}`;
      input += `/seg${d}/${val}`;
      expectedParams.push(val);
    }
    const m = matcher(input);
    expect(m).toBeDefined();
    expect(m!.data).toBe('DEEP');
    expect(m!.params).toEqual(expectedParams);
  });

  test('missing a single mid-segment fails to match', () => {
    let input = 'GET ';
    for (let d = 0; d < DEPTH; d++) {
      if (d === 10) input += `/WRONG/v${d}`;
      else input += `/seg${d}/v${d}`;
    }
    expect(matcher(input)).toBe(undefined);
  });
});

describe('stress: many params in a single route', () => {
  const N = 30;
  const router = new Router<string>();
  let pattern = 'POST /multi';
  for (let i = 0; i < N; i++) pattern += `/{p${i}}`;
  router.add(pattern, 'MULTI');
  const matcher = router.compile();

  test(`extracts ${N} params in order`, () => {
    let input = 'POST /multi';
    const expected: string[] = [];
    for (let i = 0; i < N; i++) {
      const v = `val${i}`;
      input += `/${v}`;
      expected.push(v);
    }
    const m = matcher(input);
    expect(m).toBeDefined();
    expect(m!.params).toEqual(expected);
  });
});

describe('stress: shared-prefix branching routes', () => {
  const router = new Router<string>();
  const prefixes = ['api', 'apex', 'app', 'apple', 'application'];
  for (const p of prefixes) {
    router.add(`GET /${p}/{id}`, p.toUpperCase());
    router.add(`GET /${p}/{id}/sub/{name}`, p.toUpperCase() + '_SUB');
  }
  const matcher = router.compile();

  test('distinguishes overlapping prefixes', () => {
    for (const p of prefixes) {
      const m1 = matcher(`GET /${p}/123`);
      expect(m1).toBeDefined();
      expect(m1!.data).toBe(p.toUpperCase());
      expect(m1!.params).toEqual(['123']);

      const m2 = matcher(`GET /${p}/abc/sub/xyz`);
      expect(m2).toBeDefined();
      expect(m2!.data).toBe(p.toUpperCase() + '_SUB');
      expect(m2!.params).toEqual(['abc', 'xyz']);
    }
  });

  test('unknown prefix returns undefined', () => {
    expect(matcher('GET /apricot/1')).toBe(undefined);
  });
});

describe('stress: wildcard (until \\n) and exact siblings', () => {
  const router = new Router<string>();
  router.add('GET /static/{path::\n}', 'STATIC');
  router.add('GET /static/index.html', 'INDEX');
  router.add('GET /static/{file}.txt', 'TXT');
  const matcher = router.compile();

  test('wildcard captures deep paths', () => {
    const m = matcher('GET /static/a/b/c/d/e/file.bin');
    expect(m).toBeDefined();
    expect(m!.data).toBe('STATIC');
    expect(m!.params).toEqual(['a/b/c/d/e/file.bin']);
  });

  test('more-specific exact route wins over wildcard when both could match', () => {
    const m = matcher('GET /static/index.html');
    expect(m).toBeDefined();
    expect([m!.data]).toContain('INDEX');
  });

  test('.txt extension route captures filename without extension', () => {
    const m = matcher('GET /static/notes.txt');
    expect(m).toBeDefined();
    if (m!.data === 'TXT') {
      expect(m!.params).toEqual(['notes']);
    } else {
      expect(m!.data).toBe('STATIC');
    }
  });
});

describe('stress: long path matching', () => {
  const router = new Router<string>();
  const longSeg = 'x'.repeat(2000);
  router.add(`GET /${longSeg}/{id}`, 'LONG');
  const matcher = router.compile();

  test('matches a route with a 2000-char static segment', () => {
    const m = matcher(`GET /${longSeg}/abc123`);
    expect(m).toBeDefined();
    expect(m!.data).toBe('LONG');
    expect(m!.params).toEqual(['abc123']);
  });

  test('rejects when a single char in the long segment differs', () => {
    const wrong = longSeg.slice(0, -1) + 'y';
    expect(matcher(`GET /${wrong}/abc123`)).toBe(undefined);
  });
});

describe('stress: many calls do not corrupt state between matches', () => {
  const router = new Router<string>();
  router.add('GET /a/{x}/b/{y}', 'AB');
  router.add('GET /c/{x}', 'C');
  router.add('GET /d', 'D');
  const matcher = router.compile();

  test('1000 interleaved calls return correct params each time', () => {
    for (let i = 0; i < 1000; i++) {
      const kind = i % 3;
      if (kind === 0) {
        const x = `x${i}`;
        const y = `y${i}`;
        const m = matcher(`GET /a/${x}/b/${y}`);
        expect(m!.data).toBe('AB');
        expect(m!.params).toEqual([x, y]);
      } else if (kind === 1) {
        const x = `c${i}`;
        const m = matcher(`GET /c/${x}`);
        expect(m!.data).toBe('C');
        expect(m!.params).toEqual([x]);
      } else {
        const m = matcher('GET /d');
        expect(m!.data).toBe('D');
        expect(m!.params || []).toEqual([]);
      }
    }
  });
});

describe('stress: randomized oracle (static + single until-param routes)', () => {
  const SEED = 0xc0ffee;
  const ROUTES = 150;
  const QUERIES = 600;

  const rand = mulberry32(SEED);
  const router = new Router<number>();
  const destSteps: Step[][] = [];
  const generatedInputs: {input: string; expectedData: number; expectedParams: string[]}[] = [];

  for (let i = 0; i < ROUTES; i++) {
    const method = pick(rand, ['GET', 'POST', 'PUT', 'DELETE']);
    const depth = randInt(rand, 1, 4);
    let pattern = `${method} `;
    const steps: Step[] = [];
    const inputParts: string[] = [];
    const params: string[] = [];

    const methodStep = new ExactStep(`${method} `);
    steps.push(methodStep);

    for (let d = 0; d < depth; d++) {
      const seg = randomToken(rand, 3, 8);
      pattern += `/${seg}`;
      const exact = new ExactStep(`/${seg}`);
      steps.push(exact);
      inputParts.push(`/${seg}`);

      if (rand() < 0.55 && d !== depth - 1) {
        const name = `p${d}`;
        pattern += `/{${name}}`;
        steps.push(new ExactStep('/'));
        steps.push(new UntilStep(name, '/'));
        const value = randomToken(rand, 1, 10);
        inputParts.push('/' + value);
        params.push(value);
      }
    }

    const uniquePattern = `${pattern}/_uid${i}`;
    const finalSteps: Step[] = [...steps, new ExactStep(`/_uid${i}`)];
    router.add(uniquePattern, i);
    destSteps.push(finalSteps);

    const input = `${method} ` + inputParts.join('') + `/_uid${i}`;
    generatedInputs.push({input, expectedData: i, expectedParams: params});
  }

  const matcher = router.compile();

  test('every generated route matches with correct data and params', () => {
    for (const {input, expectedData, expectedParams} of generatedInputs) {
      const m = matcher(input);
      expect(m).toBeDefined();
      expect(m!.data).toBe(expectedData);
      expect(m!.params || []).toEqual(expectedParams);
    }
  });

  test('JIT matcher agrees with naive interpreter on generated inputs', () => {
    for (let i = 0; i < generatedInputs.length; i++) {
      const {input, expectedParams} = generatedInputs[i];
      const naive = naiveMatch(destSteps[i], input);
      expect(naive).toBeDefined();
      expect(naive!.params).toEqual(expectedParams);
      const jit = matcher(input);
      expect(jit!.params || []).toEqual(naive!.params);
    }
  });

  test('random non-matching inputs return undefined', () => {
    let checked = 0;
    let attempt = 0;
    while (checked < QUERIES && attempt < QUERIES * 4) {
      attempt++;
      const method = pick(rand, ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']);
      const depth = randInt(rand, 1, 6);
      let input = `${method} `;
      for (let d = 0; d < depth; d++) input += `/${randomToken(rand, 1, 6)}`;
      const alreadyKnown = generatedInputs.some((g) => g.input === input);
      if (alreadyKnown) continue;
      const m = matcher(input);
      if (m === undefined) {
        checked++;
        continue;
      }
      const oracleHit = destSteps.some((steps) => naiveMatch(steps, input));
      expect(oracleHit).toBe(true);
      checked++;
    }
    expect(checked).toBeGreaterThan(0);
  });
});

describe('stress: regex steps mixed with exact steps', () => {
  const router = new Router<string>();
  router.add('{:(POST|PUT|PATCH)} /rpc/{method}', 'RPC');
  router.add('GET /num/{n:[0-9]+}/info', 'NUM_INFO');
  router.add('GET /hex/{h:[a-f0-9]+}', 'HEX');
  const matcher = router.compile();

  test('regex method-OR matches any of the alternatives', () => {
    for (const method of ['POST', 'PUT', 'PATCH']) {
      const m = matcher(`${method} /rpc/foo.bar`);
      expect(m).toBeDefined();
      expect(m!.data).toBe('RPC');
      expect(m!.params).toEqual(['foo.bar']);
    }
  });

  test('regex method-OR rejects non-listed methods', () => {
    expect(matcher('GET /rpc/foo')).toBe(undefined);
    expect(matcher('DELETE /rpc/foo')).toBe(undefined);
  });

  test('regex digit param matches and rejects non-digits', () => {
    expect(matcher('GET /num/12345/info')!.params).toEqual(['12345']);
    expect(matcher('GET /num/abc/info')).toBe(undefined);
  });

  test('regex hex param matches hex but not other chars', () => {
    expect(matcher('GET /hex/deadbeef')!.params).toEqual(['deadbeef']);
    expect(matcher('GET /hex/xyz')).toBe(undefined);
  });
});

describe('regex step internals (sticky lastIndex hygiene)', () => {
  test('regex must anchor at current offset, not scan forward', () => {
    const router = new Router<string>();
    router.add('GET /num/{n:[0-9]}/info', 'NUM');
    const matcher = router.compile();
    expect(matcher('GET /num/5/info')!.params).toEqual(['5']);
    expect(matcher('GET /num/x9/info')).toBe(undefined);
    expect(matcher('GET /num/x/info')).toBe(undefined);
  });

  test('1000 sequential matcher calls do not leak regex lastIndex', () => {
    const router = new Router<string>();
    router.add('{:(POST|PUT)} /rpc/{method}', 'RPC');
    router.add('GET /num/{n:[0-9]+}/info', 'NUM');
    const matcher = router.compile();
    for (let i = 0; i < 1000; i++) {
      const method = i % 2 === 0 ? 'POST' : 'PUT';
      const r1 = matcher(`${method} /rpc/op-${i}`);
      expect(r1!.data).toBe('RPC');
      expect(r1!.params).toEqual([`op-${i}`]);
      const r2 = matcher(`GET /num/${i * 7}/info`);
      expect(r2!.data).toBe('NUM');
      expect(r2!.params).toEqual([String(i * 7)]);
    }
  });

  test('two regex steps in one route advance offsets independently', () => {
    const router = new Router<string>();
    router.add('GET /pair/{a:[0-9]+}-{b:[a-z]+}/end', 'PAIR');
    const matcher = router.compile();
    const m = matcher('GET /pair/42-foo/end');
    expect(m).toBeDefined();
    expect(m!.data).toBe('PAIR');
    expect(m!.params).toEqual(['42', 'foo']);
    expect(matcher('GET /pair/-foo/end')).toBe(undefined);
    expect(matcher('GET /pair/42-/end')).toBe(undefined);
    expect(matcher('GET /pair/42-foo')).toBe(undefined);
  });

  test('advancement uses capture-group length, not full match length', () => {
    const router = new Router<string>();
    router.add('{:(POST)( )} /rpc/{method}', 'GROUPED');
    const matcher = router.compile();
    const m = matcher('POST /rpc/foo');
    expect(m).toBeDefined();
    expect(m!.data).toBe('GROUPED');
    expect(m!.params).toEqual(['foo']);
  });

  test('terminal regex with $ rejects trailing content', () => {
    const router = new Router<string>();
    router.add('GET /v{v:[0-9]+}', 'VER');
    const matcher = router.compile();
    expect(matcher('GET /v123')!.params).toEqual(['123']);
    expect(matcher('GET /vv123')).toBe(undefined);
    expect(matcher('GET /v123/')).toBe(undefined);
    expect(matcher('GET /vvv123')).toBe(undefined);
    expect(matcher('GET /v123x')).toBe(undefined);
    expect(matcher('GET /v123/extra')).toBe(undefined);
  });
});

describe('stress: many exact siblings under a dynamic prefix', () => {
  // Each route's last step is an ExactStep under a shared until-branch, so the
  // tree builds up >4 sibling exact terminals at nested depth — exercising the
  // length-switch dispatch on the nested exact path.
  const router = new Router<string>();
  const suffixes = [
    '/profile',
    '/settings',
    '/preferences',
    '/history',
    '/notifications',
    '/follows',
    '/avatar',
    '/bio',
    '/email',
    '/phone',
  ];
  for (const suffix of suffixes) router.add(`GET /users/{id}${suffix}`, suffix.slice(1).toUpperCase());
  const matcher = router.compile();

  test('each suffix routes correctly and extracts the id', () => {
    for (const suffix of suffixes) {
      const m = matcher(`GET /users/42${suffix}`);
      expect(m).toBeDefined();
      expect(m!.data).toBe(suffix.slice(1).toUpperCase());
      expect(m!.params).toEqual(['42']);
    }
  });

  test('a suffix not in the set returns undefined', () => {
    expect(matcher('GET /users/42/unknown')).toBe(undefined);
    expect(matcher('GET /users/42/profilex')).toBe(undefined);
    expect(matcher('GET /users/42/profil')).toBe(undefined);
  });

  test('still works when id contains alphanumerics', () => {
    const m = matcher('GET /users/abc-123/settings');
    expect(m!.params).toEqual(['abc-123']);
  });
});

describe('stress: 1k routes compile and resolve', () => {
  const N = 1000;
  const router = new Router<number>();
  for (let i = 0; i < N; i++) {
    router.add(`GET /bulk/${i}/{id}`, i);
  }

  let matcher: ReturnType<typeof router.compile>;
  test('compiles', () => {
    matcher = router.compile();
    expect(typeof matcher).toBe('function');
  });

  test('matches every one of the 1000 routes', () => {
    for (let i = 0; i < N; i++) {
      const m = matcher(`GET /bulk/${i}/x${i}`);
      expect(m).toBeDefined();
      expect(m!.data).toBe(i);
      expect(m!.params).toEqual([`x${i}`]);
    }
  });

  test('non-existing bulk index returns undefined', () => {
    expect(matcher(`GET /bulk/${N + 1}/x`)).toBe(undefined);
    expect(matcher(`GET /bulk/-1/x`)).toBe(undefined);
  });
});
