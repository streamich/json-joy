import {vi} from 'vitest';
import {KeyContext} from '../KeyContext';
import {KeySourceManual} from '../KeySourceManual';

const setup = () => {
  const ctx = new KeyContext();
  const src = new KeySourceManual();
  src.bind(ctx);
  return {ctx, src};
};

describe('key sequences', () => {
  test('g g sequence fires', async () => {
    const {ctx, src} = setup();
    let hit = 0;
    ctx.map.setSequence('g g', () => hit++);
    await src.sendSequence([['g'], ['g']]);
    expect(hit).toBe(1);
  });

  test('sequence does not fire on partial match alone', async () => {
    const {ctx, src} = setup();
    let hit = 0;
    ctx.map.setSequence('g g', () => hit++);
    await src.send('g');
    expect(hit).toBe(0);
  });

  test('non-matching key resets sequence', async () => {
    const {ctx, src} = setup();
    let hit = 0;
    ctx.map.setSequence('g i', () => hit++);
    await src.sendSequence([['g'], ['x'], ['i']]);
    expect(hit).toBe(0);
  });

  test('Ctrl+K Ctrl+D sequence', async () => {
    const {ctx, src} = setup();
    let hit = 0;
    ctx.map.setSequence('Control+k Control+d', () => hit++);
    await src.sendSequence([
      ['k', 'Control'],
      ['d', 'Control'],
    ]);
    expect(hit).toBe(1);
  });

  test('three-step sequence: Escape g i', async () => {
    const {ctx, src} = setup();
    let hit = 0;
    ctx.map.setSequence('Escape g i', () => hit++);
    await src.sendSequence([['Escape'], ['g'], ['i']]);
    expect(hit).toBe(1);
  });

  test('three-step sequence does not fire on two steps', async () => {
    const {ctx, src} = setup();
    let hit = 0;
    ctx.map.setSequence('Escape g i', () => hit++);
    await src.sendSequence([['Escape'], ['g']]);
    expect(hit).toBe(0);
  });

  test('single-key and sequence coexist (fire-and-track)', async () => {
    const {ctx, src} = setup();
    let singleHit = 0;
    let seqHit = 0;
    ctx.map.setPress('g', () => singleHit++);
    ctx.map.setSequence('g g', () => seqHit++);
    await src.sendSequence([['g'], ['g']]);
    expect(singleHit).toBe(2); // single fires on both presses
    expect(seqHit).toBe(1); // sequence fires once
  });

  test('sequence times out after sequenceTimeoutMs', async () => {
    vi.useFakeTimers();
    try {
      const {ctx, src} = setup();
      let hit = 0;
      ctx.map.setSequence('g i', () => hit++);
      await src.send('g');
      // Advance time beyond the default 1000ms timeout.
      vi.advanceTimersByTime(1100);
      await src.send('i');
      expect(hit).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  test('delSequence removes the binding', async () => {
    const {ctx, src} = setup();
    let hit = 0;
    const action = () => hit++;
    ctx.map.setSequence('g g', action);
    ctx.map.delSequence('g g', action);
    await src.sendSequence([['g'], ['g']]);
    expect(hit).toBe(0);
  });

  test('bind() shorthand array routes sequence correctly', async () => {
    const {ctx, src} = setup();
    let hit = 0;
    const unbind = ctx.bind([['g g', () => hit++]]);
    await src.sendSequence([['g'], ['g']]);
    expect(hit).toBe(1);
    unbind();
    await src.sendSequence([['g'], ['g']]);
    expect(hit).toBe(1); // still 1 after unbind
  });

  test('multiple sequences registered independently', async () => {
    const {ctx, src} = setup();
    let hit1 = 0;
    let hit2 = 0;
    ctx.map.setSequence('g g', () => hit1++);
    ctx.map.setSequence('g i', () => hit2++);
    await src.sendSequence([['g'], ['g']]);
    expect(hit1).toBe(1);
    expect(hit2).toBe(0);
    await src.sendSequence([['g'], ['i']]);
    expect(hit1).toBe(1);
    expect(hit2).toBe(1);
  });

  test('onReset resets sequence matcher', async () => {
    const {ctx, src} = setup();
    let hit = 0;
    ctx.map.setSequence('g g', () => hit++);
    await src.send('g');
    src.reset(); // triggers onReset
    await src.send('g');
    expect(hit).toBe(0); // sequence was broken by reset
  });

  test('eager fire: shorter sequence fires before longer completes', async () => {
    const {ctx, src} = setup();
    let shortHit = 0;
    let longHit = 0;
    ctx.map.setSequence('g i', () => shortHit++);
    ctx.map.setSequence('g i x', () => longHit++);
    await src.sendSequence([['g'], ['i']]);
    expect(shortHit).toBe(1);
    expect(longHit).toBe(0);
    await src.send('x');
    expect(longHit).toBe(1);
  });

  test('SequenceMap.isEmpty() returns true when empty', () => {
    const {ctx} = setup();
    expect(ctx.map.sequenceMap.isEmpty()).toBe(true);
  });

  test('SequenceMap.isEmpty() returns false after set()', () => {
    const {ctx} = setup();
    ctx.map.setSequence('g g', () => {});
    expect(ctx.map.sequenceMap.isEmpty()).toBe(false);
  });

  test('sendSequence helper sends keys sequentially', async () => {
    const {ctx, src} = setup();
    const sigs: string[] = [];
    ctx.map.setPress('', (k) => sigs.push(k.sig()));
    await src.sendSequence([['a'], ['b'], ['c']]);
    expect(sigs).toEqual(['a', 'b', 'c']);
  });
});
