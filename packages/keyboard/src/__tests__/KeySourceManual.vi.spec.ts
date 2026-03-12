import {Key} from '../Key';
import {KeyContext} from '../KeyContext';
import {KeySourceManual} from '../KeySourceManual';

describe('KeySourceManual', () => {
  test('press() is a no-op before bind()', () => {
    const src = new KeySourceManual();
    expect(() => src.press('a')).not.toThrow();
  });

  test('release() is a no-op before bind()', () => {
    const src = new KeySourceManual();
    expect(() => src.release('a')).not.toThrow();
  });

  test('reset() is a no-op before bind()', () => {
    const src = new KeySourceManual();
    expect(() => src.reset()).not.toThrow();
  });

  test('bind() connects source to sink', () => {
    const ctx = new KeyContext();
    const src = new KeySourceManual();
    let pressed = 0;
    ctx.map.setPress('a', () => {
      pressed++;
    });
    src.bind(ctx);
    src.press('a');
    expect(pressed).toBe(1);
  });

  test('unbind() disconnects source from sink', () => {
    const ctx = new KeyContext();
    const src = new KeySourceManual();
    let pressed = 0;
    ctx.map.setPress('a', () => {
      pressed++;
    });
    const unbind = src.bind(ctx);
    unbind();
    src.press('a');
    expect(pressed).toBe(0);
  });

  test('press() with string creates Key and triggers onPress', () => {
    const ctx = new KeyContext();
    const src = new KeySourceManual();
    src.bind(ctx);
    src.press('b');
    expect(ctx.pressed.keys.length).toBe(1);
    expect(ctx.pressed.keys[0].key).toBe('b');
  });

  test('press() with Key instance uses it directly', () => {
    const ctx = new KeyContext();
    const src = new KeySourceManual();
    src.bind(ctx);
    const key = new Key('Enter', Date.now());
    src.press(key);
    expect(ctx.pressed.keys[0].key).toBe('Enter');
  });

  test('press() with modifier string', () => {
    const ctx = new KeyContext();
    const src = new KeySourceManual();
    src.bind(ctx);
    let received: Key | undefined;
    ctx.map.setPress('Control+a', (k) => {
      received = k;
    });
    src.press('a', 'Control');
    expect(received).toBeDefined();
    expect(received!.mod).toBe('Control');
  });

  test('release() removes key from pressed set', () => {
    const ctx = new KeyContext();
    const src = new KeySourceManual();
    src.bind(ctx);
    src.press('x');
    expect(ctx.pressed.keys.length).toBe(1);
    src.release('x');
    expect(ctx.pressed.keys.length).toBe(0);
  });

  test('reset() clears pressed set', () => {
    const ctx = new KeyContext();
    const src = new KeySourceManual();
    src.bind(ctx);
    src.press('a');
    src.press('b');
    expect(ctx.pressed.keys.length).toBe(2);
    src.reset();
    expect(ctx.pressed.keys.length).toBe(0);
  });

  test('send() presses then releases asynchronously', async () => {
    const ctx = new KeyContext();
    const src = new KeySourceManual();
    src.bind(ctx);
    await src.send('a');
    // After send() resolves: key should have been pressed then released
    expect(ctx.pressed.keys.length).toBe(0);
  });

  test('send() with modifier fires correct signature', async () => {
    const ctx = new KeyContext();
    const src = new KeySourceManual();
    src.bind(ctx);
    let hits = 0;
    ctx.map.setPress('Meta+s', () => {
      hits++;
    });
    await src.send('s', 'Meta');
    expect(hits).toBe(1);
  });
});
