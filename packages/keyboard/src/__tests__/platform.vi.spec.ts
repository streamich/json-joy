import {expandMod, mod} from '../util';
import {Key} from '../Key';
import {KeyMap} from '../KeyMap';

describe('mod', () => {
  test('is "C" or "M"', () => {
    expect(mod === 'C' || mod === 'M').toBe(true);
  });
});

describe('expandPlatformMod', () => {
  const primary = mod;

  test('expands P to platform primary modifier', () => {
    expect(expandMod('P+s')).toBe(`${primary}+s`);
  });

  test('expands P in multi-modifier prefix (AP)', () => {
    expect(expandMod('AP+s')).toBe(`A${primary}+s`);
  });

  test('expands P in multi-modifier prefix (PS)', () => {
    const result = expandMod('PS+s');
    // P expands to M or C; canonical order: C < M < S, so result is CS+s or MS+s
    expect(result).toBe(mod === 'M' ? 'MS+s' : 'CS+s');
  });

  test('expands P in APS prefix', () => {
    expect(expandMod('APS+s')).toBe(mod === 'M' ? 'AMS+s' : 'ACS+s');
  });

  test('works with SigKey Enter', () => {
    expect(expandMod('P+Enter')).toBe(`${primary}+Enter`);
  });

  test('returns unchanged sig when no P present', () => {
    expect(expandMod('C+s')).toBe('C+s');
    expect(expandMod('M+s')).toBe('M+s');
    expect(expandMod('a')).toBe('a');
    expect(expandMod('ACM+s')).toBe('ACM+s');
    expect(expandMod('')).toBe('');
    expect(expandMod('?')).toBe('?');
  });

  test('deduplicates if P expands to an already-present modifier', () => {
    const result = expandMod(mod === 'M' ? 'MP+s' : 'CP+s');
    expect(result).toBe(`${primary}+s`);
  });
});

describe('KeyMap with P modifier', () => {
  const primary = mod;

  test('bind() with P-shorthand stores under concrete modifier key', () => {
    const map = new KeyMap();
    let called = 0;
    const action = () => { called++; };
    map.bind([['P+s' as any, action]]);

    // Must NOT match under the raw 'P+s' key
    const rawPKey = new Key('s', Date.now(), 'P' as any);
    expect(map.matchPress(rawPKey)).toBeUndefined();

    // MUST match under the concrete modifier
    const concreteKey = new Key('s', Date.now(), primary as any);
    const matches = map.matchPress(concreteKey);
    expect(matches).toBeDefined();
    expect(matches!.length).toBe(1);
    matches![0].action(concreteKey);
    expect(called).toBe(1);
  });

  test('setPress with P modifier stores under concrete modifier key', () => {
    const map = new KeyMap();
    let called = 0;
    const action = () => { called++; };
    map.setPress(`P+s` as any, action);

    const concreteKey = new Key('s', Date.now(), primary as any);
    const matches = map.matchPress(concreteKey);
    expect(matches).toBeDefined();
    matches![0].action(concreteKey);
    expect(called).toBe(1);
  });

  test('delPress with P modifier removes the concrete binding', () => {
    const map = new KeyMap();
    const action = () => {};
    map.setPress(`P+s` as any, action);
    map.delPress(`P+s` as any, action);

    const concreteKey = new Key('s', Date.now(), primary as any);
    expect(map.matchPress(concreteKey)).toBeUndefined();
  });

  test('setRelease with P modifier stores under concrete modifier key', () => {
    const map = new KeyMap();
    let called = 0;
    const action = () => { called++; };
    map.setRelease(`P+s` as any, action);

    const concreteKey = new Key('s', Date.now(), primary as any);
    const matches = map.matchRelease(concreteKey);
    expect(matches).toBeDefined();
    matches![0].action(concreteKey);
    expect(called).toBe(1);
  });
});
