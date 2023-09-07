import {parseParamKey} from "../util";

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
    expect(parseParamKey('j.a/foo')).toBe(undefined);
    expect(parseParamKey('j.foo')).toBe(undefined);
    expect(parseParamKey('string-number/foo')).toBe(undefined);
  });
});
