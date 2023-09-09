import {defaultCodecs} from '../defaultCodecs';
import {ingestParams, parseParamKey} from '../util';

describe('parseParamKey()', () => {
  test('can parse valid param keys', () => {
    expect(parseParamKey('j/foo')).toStrictEqual(['j', '/foo']);
    expect(parseParamKey('json/foo/bar')).toStrictEqual(['json', '/foo/bar']);
    expect(parseParamKey('n/value')).toStrictEqual(['n', '/value']);
    expect(parseParamKey('num/value/a/b/')).toStrictEqual(['num', '/value/a/b/']);
    expect(parseParamKey('s/name')).toStrictEqual(['s', '/name']);
    expect(parseParamKey('str/')).toStrictEqual(['str', '/']);
    expect(parseParamKey('b/isValid')).toStrictEqual(['b', '/isValid']);
    expect(parseParamKey('bool/lol')).toStrictEqual(['bool', '/lol']);
  });

  test('returns undefined on invalid param', () => {
    expect(parseParamKey('j.a/foo')).toStrictEqual([]);
    expect(parseParamKey('j.foo')).toStrictEqual([]);
    expect(parseParamKey('string-number/foo')).toStrictEqual([]);
  });
});

describe('ingestParams()', () => {
  test('throws un unknown parameter type', () => {
    const request = {};
    expect(() =>
      ingestParams(
        {
          'hmmmmm/foo': '{"gg":"bet"}',
        },
        request,
        defaultCodecs,
      ),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`"Invalid param type: hmmmmm"`);
  });

  test('can ingest JSON', async () => {
    const request = {};
    await ingestParams(
      {
        'json/foo': '{"gg":"bet"}',
        'j/a': '[1, 2, 3]',
      },
      request,
      defaultCodecs,
    );
    expect(request).toStrictEqual({
      foo: {gg: 'bet'},
      a: [1, 2, 3],
    });
  });

  test('can ingest strings', async () => {
    const request = {};
    await ingestParams(
      {
        'str/foo': 'abc',
        's/bar': 'xyz',
      },
      request,
      defaultCodecs,
    );
    expect(request).toStrictEqual({
      foo: 'abc',
      bar: 'xyz',
    });
  });

  test('can ingest numbers', async () => {
    const request = {};
    await ingestParams(
      {
        'num/foo': '123',
        'n/bar': '-3.14',
      },
      request,
      defaultCodecs,
    );
    expect(request).toStrictEqual({
      foo: 123,
      bar: -3.14,
    });
  });

  test('can ingest booleans', async () => {
    const request = {};
    await ingestParams(
      {
        'bool/foo': 'true',
        'b/bar': 'false',
      },
      request,
      defaultCodecs,
    );
    expect(request).toStrictEqual({
      foo: true,
      bar: false,
    });
  });

  test('can ingest null and undefined', async () => {
    const request = {};
    await ingestParams(
      {
        'nil/foo': '123',
        'und/bar': '123',
      },
      request,
      defaultCodecs,
    );
    expect(request).toStrictEqual({
      foo: null,
      bar: undefined,
    });
  });
});
