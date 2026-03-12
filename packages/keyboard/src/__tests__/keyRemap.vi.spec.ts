import {KeyContext} from '../KeyContext';
import {KeySourceManual} from '../KeySourceManual';

const setup = () => {
  const ctx = new KeyContext();
  const src = new KeySourceManual();
  src.bind(ctx);
  return {ctx, src};
};

describe('key remapping', () => {
  test('remapped key triggers binding registered under the target name', async () => {
    const {ctx, src} = setup();
    let hit = 0;
    ctx.setRemap('Esc', 'Escape');
    ctx.map.setPress('Escape', () => hit++);
    await src.send('Esc');
    expect(hit).toBe(1);
  });

  test('un-remap does not affect the binding', async () => {
    const {ctx, src} = setup();
    let hit = 0;
    ctx.setRemap('Esc', 'Escape');
    ctx.map.setPress('Escape', () => hit++);
    ctx.delRemap('Esc');
    await src.send('Esc');
    expect(hit).toBe(0);
  });

  test('original key name still works when no remap configured', async () => {
    const {ctx, src} = setup();
    let hit = 0;
    ctx.map.setPress('Escape', () => hit++);
    await src.send('Escape');
    expect(hit).toBe(1);
  });

  test('space remap: " " remaps to Space', async () => {
    const {ctx, src} = setup();
    let hit = 0;
    ctx.setRemap(' ', 'Space');
    ctx.map.setPress('Space', () => hit++);
    await src.send(' ');
    expect(hit).toBe(1);
  });

  test('Return remaps to Enter', async () => {
    const {ctx, src} = setup();
    let hit = 0;
    ctx.setRemap('Return', 'Enter');
    ctx.map.setPress('Enter', () => hit++);
    await src.send('Return');
    expect(hit).toBe(1);
  });

  test('remap with modifier prefix', async () => {
    const {ctx, src} = setup();
    let hit = 0;
    ctx.setRemap('Esc', 'Escape');
    ctx.map.setPress('Control+Escape', () => hit++);
    await src.send('Esc', 'Control');
    expect(hit).toBe(1);
  });

  test('remapped key works as first step of a sequence', async () => {
    const {ctx, src} = setup();
    let hit = 0;
    ctx.setRemap('Esc', 'Escape');
    ctx.map.setSequence('Escape g', () => hit++);
    await src.send('Esc');
    await src.send('g');
    expect(hit).toBe(1);
  });

  test('remapped key works as second step of a sequence', async () => {
    const {ctx, src} = setup();
    let hit = 0;
    ctx.setRemap('Return', 'Enter');
    ctx.map.setSequence('g Enter', () => hit++);
    await src.send('g');
    await src.send('Return');
    expect(hit).toBe(1);
  });

  test('release binding fires on remapped key', async () => {
    const {ctx, src} = setup();
    let hit = 0;
    ctx.setRemap('Esc', 'Escape');
    ctx.map.setRelease('Escape', () => hit++);
    await src.send('Esc');
    expect(hit).toBe(1);
  });

  test('key.key in action callback is the canonical remapped name', async () => {
    const {ctx, src} = setup();
    let receivedKey = '';
    ctx.setRemap('Esc', 'Escape');
    ctx.map.setPress('Escape', (k) => (receivedKey = k.key));
    await src.send('Esc');
    expect(receivedKey).toBe('Escape');
  });

  test('remapped key.key is stored in history', async () => {
    const {ctx, src} = setup();
    ctx.setRemap('Return', 'Enter');
    await src.send('Return');
    expect(ctx.history[ctx.history.length - 1].key).toBe('Enter');
  });

  test('parent receives original (pre-remap) key when child remaps', async () => {
    const ctx = new KeyContext();
    const src = new KeySourceManual();
    src.bind(ctx);
    const child = ctx.child('child');

    const parentSeen: string[] = [];
    ctx.map.setPress('', (k) => parentSeen.push(k.key));

    child.setRemap('Esc', 'Escape');
    await src.send('Esc');
    // parent should see 'Esc', not 'Escape'
    expect(parentSeen).toEqual(['Esc']);
  });

  test('parent can apply its own remap independently', async () => {
    const ctx = new KeyContext();
    const src = new KeySourceManual();
    src.bind(ctx);
    const child = ctx.child('child');

    let parentHit = 0;
    child.setRemap('Esc', 'Escape');
    child.map.setPress('Escape', () => {} /* no propagate */);
    ctx.setRemap('Esc', 'Enter');
    ctx.map.setPress('Enter', () => parentHit++);

    await src.send('Esc');
    // child consumed it, parent never called
    expect(parentHit).toBe(0);
  });

  test('remap is undefined initially', () => {
    const {ctx} = setup();
    expect(ctx.remap).toBeUndefined();
  });

  test('remap becomes undefined again after last entry deleted', () => {
    const {ctx} = setup();
    ctx.setRemap('Esc', 'Escape');
    expect(ctx.remap).toBeDefined();
    ctx.delRemap('Esc');
    expect(ctx.remap).toBeUndefined();
  });

  test('multiple remaps coexist', async () => {
    const {ctx, src} = setup();
    const hits: string[] = [];
    ctx.setRemap('Esc', 'Escape');
    ctx.setRemap('Return', 'Enter');
    ctx.map.setPress('Escape', () => hits.push('Escape'));
    ctx.map.setPress('Enter', () => hits.push('Enter'));
    await src.send('Esc');
    await src.send('Return');
    expect(hits).toEqual(['Escape', 'Enter']);
  });
});
