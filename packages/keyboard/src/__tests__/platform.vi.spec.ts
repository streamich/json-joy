import {expandMod, mod} from '../util';
import {Key} from '../Key';
import {KeyMap} from '../KeyMap';

describe('mod', () => {
  test('is "Control" or "Meta"', () => {
    expect(mod === 'Control' || mod === 'Meta').toBe(true);
  });
});

describe('expandPlatformMod', () => {
  const primary = mod;

  test('expands Primary to platform primary modifier', () => {
    expect(expandMod('Primary+s')).toBe(`${primary}+s`);
  });

  test('expands Primary in multi-modifier prefix (Alt+Primary)', () => {
    expect(expandMod('Alt+Primary+s')).toBe(mod === 'Meta' ? 'Alt+Meta+s' : 'Alt+Control+s');
  });

  test('expands Primary in multi-modifier prefix (Primary+Shift)', () => {
    const result = expandMod('Primary+Shift+s');
    expect(result).toBe(mod === 'Meta' ? 'Meta+Shift+s' : 'Control+Shift+s');
  });

  test('expands Primary in Alt+Primary+Shift prefix', () => {
    expect(expandMod('Alt+Primary+Shift+s')).toBe(mod === 'Meta' ? 'Alt+Meta+Shift+s' : 'Alt+Control+Shift+s');
  });

  test('works with SigKey Enter', () => {
    expect(expandMod('Primary+Enter')).toBe(`${primary}+Enter`);
  });

  test('returns unchanged sig when no Primary present', () => {
    expect(expandMod('Control+s')).toBe('Control+s');
    expect(expandMod('Meta+s')).toBe('Meta+s');
    expect(expandMod('a')).toBe('a');
    expect(expandMod('Alt+Control+Meta+s')).toBe('Alt+Control+Meta+s');
    expect(expandMod('')).toBe('');
    expect(expandMod('?')).toBe('?');
  });

  test('deduplicates if Primary expands to an already-present modifier', () => {
    const result = expandMod(mod === 'Meta' ? 'Meta+Primary+s' : 'Control+Primary+s');
    expect(result).toBe(`${primary}+s`);
  });
});

describe('KeyMap with Primary modifier', () => {
  const primary = mod;

  test('bind() with Primary-shorthand stores under concrete modifier key', () => {
    const map = new KeyMap();
    let called = 0;
    const action = () => {
      called++;
    };
    map.bind([['Primary+s' as any, action]]);

    // Must NOT match under the raw 'Primary+s' key
    const rawPKey = new Key('s', Date.now(), 'Primary' as any);
    expect(map.matchPress(rawPKey)).toBeUndefined();

    // MUST match under the concrete modifier
    const concreteKey = new Key('s', Date.now(), primary as any);
    const matches = map.matchPress(concreteKey);
    expect(matches).toBeDefined();
    expect(matches!.length).toBe(1);
    matches![0].action(concreteKey);
    expect(called).toBe(1);
  });

  test('setPress with Primary modifier stores under concrete modifier key', () => {
    const map = new KeyMap();
    let called = 0;
    const action = () => {
      called++;
    };
    map.setPress(`Primary+s` as any, action);

    const concreteKey = new Key('s', Date.now(), primary as any);
    const matches = map.matchPress(concreteKey);
    expect(matches).toBeDefined();
    matches![0].action(concreteKey);
    expect(called).toBe(1);
  });

  test('delPress with Primary modifier removes the concrete binding', () => {
    const map = new KeyMap();
    const action = () => {};
    map.setPress(`Primary+s` as any, action);
    map.delPress(`Primary+s` as any, action);

    const concreteKey = new Key('s', Date.now(), primary as any);
    expect(map.matchPress(concreteKey)).toBeUndefined();
  });

  test('setRelease with Primary modifier stores under concrete modifier key', () => {
    const map = new KeyMap();
    let called = 0;
    const action = () => {
      called++;
    };
    map.setRelease(`Primary+s` as any, action);

    const concreteKey = new Key('s', Date.now(), primary as any);
    const matches = map.matchRelease(concreteKey);
    expect(matches).toBeDefined();
    matches![0].action(concreteKey);
    expect(called).toBe(1);
  });
});
