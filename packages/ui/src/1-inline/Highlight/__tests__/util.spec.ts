import {highlight, highlightFuzzy, normalize} from '../util';

describe('highlight', () => {
  test('can highlight a single token', () => {
    const result = normalize(highlight('foo bar, another foo and bar', ['foo']));
    expect(result).toStrictEqual([['foo'], ' bar, another ', ['foo'], ' and bar']);
  });

  test('can highlight two tokens', () => {
    const result = normalize(highlight('foo bar, another foo and bar', ['foo', 'bar']));
    expect(result).toStrictEqual([['foo bar'], ', another ', ['foo'], ' and ', ['bar']]);
  });

  test('returns text as-is, when there is nothing to highlight', () => {
    const result = normalize(highlight('foo bar, another foo and bar', ['baz', 'gg']));
    expect(result).toStrictEqual(['foo bar, another foo and bar']);
  });

  test('can highlight complete text match', () => {
    const result = normalize(highlight('foo', ['foo']));
    expect(result).toStrictEqual([['foo']]);
  });

  test('can highlight complete text match twice', () => {
    const result = normalize(highlight('foofoo', ['foo']));
    // expect(result).toStrictEqual([['foo'], ['foo']]);
    expect(result).toStrictEqual([['foofoo']]);
  });

  test('works with empty token list', () => {
    const result = normalize(highlight('foofoo', []));
    expect(result).toStrictEqual(['foofoo']);
  });

  test('works with empty token string', () => {
    const result2 = normalize(highlight('foofoo', ['']));
    expect(result2).toStrictEqual(['foofoo']);
  });

  test('can highlight overlaying tokens', () => {
    const result2 = normalize(highlight('I like playing with bazooka', ['bazooka', 'zoo']));
    expect(result2).toStrictEqual(['I like playing with ', ['bazooka']]);
  });

  test('can highlight overlaying tokens - 2', () => {
    const result2 = normalize(highlight('I like playing with bazooka', ['zoo', 'bazooka']));
    expect(result2).toStrictEqual(['I like playing with ba', ['zoo'], 'ka']);
  });

  test('combines adjacent tokens with space gap', () => {
    const res = normalize(highlight('foo bar', ['foo', 'bar']));
    expect(res).toStrictEqual([['foo bar']]);
  });
});

describe('highlightFuzzy', () => {
  test('can highlight exact match', () => {
    const res = highlightFuzzy('New workspace', 'orkspace');
    expect(res).toStrictEqual(['New w', ['orkspace']]);
  });

  test('can match missing syllables', () => {
    const res = highlightFuzzy('New workspace', 'wrkspc');
    expect(res).toStrictEqual(['Ne', ['w'], ' wo', ['rksp'], 'a', ['c'], 'e']);
  });

  test('can do exact match', () => {
    const res = highlightFuzzy('foo', 'foo');
    expect(res).toStrictEqual([['foo']]);
  });

  test('can match beginning of string', () => {
    const res = highlightFuzzy('foo bar', 'foo');
    expect(res).toStrictEqual([['foo'], ' bar']);
  });

  test('can match end of string', () => {
    const res = highlightFuzzy('foo bar', 'bar');
    expect(res).toStrictEqual(['foo ', ['bar']]);
  });

  test('works when source text is empty', () => {
    const res = highlightFuzzy('', 'bar');
    expect(res).toStrictEqual([]);
  });

  test('works when query token is empty', () => {
    const res = highlightFuzzy('foo', '');
    expect(res).toStrictEqual(['foo']);
  });

  test('works when there is not match', () => {
    const res = highlightFuzzy('foo', 'bar');
    expect(res).toStrictEqual(['foo']);
    const res2 = highlightFuzzy('foo', 'a');
    expect(res2).toStrictEqual(['foo']);
    const res3 = highlightFuzzy('foo', 'bbbbb');
    expect(res3).toStrictEqual(['foo']);
  });

  test('does not highlight a single character match', () => {
    const res = highlightFuzzy('foo', 'f');
    expect(res).toStrictEqual(['foo']);
  });
});
