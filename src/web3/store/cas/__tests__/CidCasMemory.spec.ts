import {CidCasMemory} from '../CidCasMemory';

describe('put()', () => {
  test('can store and read a value', async () => {
    const cas = new CidCasMemory();
    const value = new Uint8Array([1, 2, 3]);
    const cid = await cas.put(value);
    const stored = await cas.get(cid);
    expect(stored).toEqual(value);
  });
});

describe('del()', () => {
  test('can remove an item', async () => {
    const cas = new CidCasMemory();
    const value = new Uint8Array([25]);
    const cid = await cas.put(value);
    expect(await cas.has(cid)).toBe(true);
    expect(await cas.has(cid)).toBe(true);
    await cas.del(cid);
    expect(await cas.has(cid)).toBe(false);
    expect(await cas.has(cid)).toBe(false);
  });

  test('does not throw when deleting non-existing item', async () => {
    const cas1 = new CidCasMemory();
    const cas2 = new CidCasMemory();
    const value = new Uint8Array([25]);
    const cid = await cas1.put(value);
    await cas2.del(cid);
    await cas2.del(cid);
    await cas2.del(cid);
  });
});

describe('has()', () => {
  test('can check if item exists', async () => {
    const cas1 = new CidCasMemory();
    const cas2 = new CidCasMemory();
    const value = new Uint8Array([1, 2, 3]);
    const cid = await cas1.put(value);
    const has1 = await cas1.has(cid);
    const has2 = await cas2.has(cid);
    expect(has1).toBe(true);
    expect(has2).toBe(false);
  });

  test('returns false for deleted item', async () => {
    const cas1 = new CidCasMemory();
    const value = new Uint8Array([1, 2, 3]);
    const cid = await cas1.put(value);
    const has1 = await cas1.has(cid);
    expect(has1).toBe(true);
    await cas1.del(cid);
    const has2 = await cas1.has(cid);
    expect(has2).toBe(false);
  });
});
