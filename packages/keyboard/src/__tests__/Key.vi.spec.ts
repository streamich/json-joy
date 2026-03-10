import {Key} from '../Key';
import type {KeyEvent} from '../types';

const mkEvent = (overrides: Partial<KeyEvent> = {}): KeyEvent => ({
  key: 'a',
  altKey: false,
  ctrlKey: false,
  metaKey: false,
  shiftKey: false,
  isComposing: false,
  repeat: false,
  stopPropagation: () => {},
  preventDefault: () => {},
  ...overrides,
});

describe('Key.fromEvent()', () => {
  test('creates Key from basic event', () => {
    const key = Key.fromEvent(mkEvent({key: 'a'}));
    expect(key.key).toBe('a');
    expect(key.mod).toBe('');
  });

  test('sets mod=A for Alt', () => {
    const key = Key.fromEvent(mkEvent({altKey: true}));
    expect(key.mod).toBe('A');
  });

  test('sets mod=C for Ctrl', () => {
    const key = Key.fromEvent(mkEvent({ctrlKey: true}));
    expect(key.mod).toBe('C');
  });

  test('sets mod=M for Meta', () => {
    const key = Key.fromEvent(mkEvent({metaKey: true}));
    expect(key.mod).toBe('M');
  });

  test('sets mod=S for Shift', () => {
    const key = Key.fromEvent(mkEvent({shiftKey: true}));
    expect(key.mod).toBe('S');
  });

  test('combines modifiers in ACMS order', () => {
    const key = Key.fromEvent(mkEvent({altKey: true, ctrlKey: true, metaKey: true, shiftKey: true}));
    expect(key.mod).toBe('ACMS');
  });

  test('sets mod=CS for Ctrl+Shift', () => {
    const key = Key.fromEvent(mkEvent({ctrlKey: true, shiftKey: true}));
    expect(key.mod).toBe('CS');
  });

  test('uses empty string when key is undefined', () => {
    const key = Key.fromEvent(mkEvent({key: undefined}));
    expect(key.key).toBe('');
  });

  test('sets event reference', () => {
    const event = mkEvent({key: 'Enter'});
    const key = Key.fromEvent(event);
    expect(key.event).toBe(event);
  });

  test('sets ts to approximately Date.now()', () => {
    const before = Date.now();
    const key = Key.fromEvent(mkEvent());
    const after = Date.now();
    expect(key.ts).toBeGreaterThanOrEqual(before);
    expect(key.ts).toBeLessThanOrEqual(after);
  });
});

describe('Key.sig()', () => {
  test('returns lowercase letter signature', () => {
    const key = new Key('a', 0);
    expect(key.sig()).toBe('a');
  });

  test('lowercases uppercase letter', () => {
    const key = new Key('A', 0);
    expect(key.sig()).toBe('a');
  });

  test('includes modifier prefix', () => {
    const key = new Key('a', 0, 'C');
    expect(key.sig()).toBe('C+a');
  });

  test('includes multiple modifiers', () => {
    const key = new Key('a', 0, 'CS');
    expect(key.sig()).toBe('CS+a');
  });

  test('passes through function keys unchanged', () => {
    const key = new Key('F5', 0);
    expect(key.sig()).toBe('F5');
  });

  test('passes through ArrowUp unchanged', () => {
    const key = new Key('ArrowUp', 0);
    expect(key.sig()).toBe('ArrowUp');
  });

  test('passes through Enter unchanged', () => {
    const key = new Key('Enter', 0);
    expect(key.sig()).toBe('Enter');
  });

  test('normalises space to "Space"', () => {
    const key = new Key(' ', 0);
    expect(key.sig()).toBe('Space');
  });

  test('normalises space with modifier', () => {
    const key = new Key(' ', 0, 'C');
    expect(key.sig()).toBe('C+Space');
  });

  test('appends :R for repeat events', () => {
    const event = mkEvent({key: 'a', repeat: true});
    const key = Key.fromEvent(event);
    expect(key.sig()).toBe('a:R');
  });

  test('appends :R after modifier+key', () => {
    const event = mkEvent({key: 'a', ctrlKey: true, repeat: true});
    const key = Key.fromEvent(event);
    expect(key.sig()).toBe('C+a:R');
  });

  test('no :R suffix for non-repeat', () => {
    const event = mkEvent({key: 'a', repeat: false});
    const key = Key.fromEvent(event);
    expect(key.sig()).toBe('a');
  });
});

describe('Key constructor defaults', () => {
  test('propagate defaults to true', () => {
    const key = new Key('a', 0);
    expect(key.propagate).toBe(true);
  });

  test('mod defaults to empty string', () => {
    const key = new Key('a', 0);
    expect(key.mod).toBe('');
  });

  test('event defaults to undefined', () => {
    const key = new Key('a', 0);
    expect(key.event).toBeUndefined();
  });
});
