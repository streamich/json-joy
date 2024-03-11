/** @jest-environment node */
import {MemoryLevel} from 'memory-level';
import {b} from '../../../../util/buffer/b';
import {HlcFactory} from '../../../hlc';
import {LevelCAS} from '../../LevelCAS';
import {MemoryCAS} from '../../MemoryCAS';
import {HamtCrdt} from '../HamtCrdt';

const setup = () => {
  const hlc = new HlcFactory({
    getTs: () => Math.floor(Date.now() / 1000),
    processId: 123,
  });
  const db = new MemoryLevel<Uint8Array, Uint8Array>({
    keyEncoding: 'view',
    valueEncoding: 'view',
  });
  const cas = new LevelCAS({db});
  const hamt = new HamtCrdt({
    hlc,
    cas,
  });
  return {
    hlc,
    db,
    cas,
    hamt,
  };
};

const toArr = (buf: Uint8Array): number[] => {
  const arr: number[] = [];
  for (let i = 0; i < buf.length; i++) arr.push(buf[i]);
  return arr;
};

test('can store file in IPFS', async () => {
  const {cas} = setup();
  const cid = await cas.put(b(1, 2, 3));
  const data = await cas.get(cid);
  expect(data).toStrictEqual(b(1, 2, 3));
});

describe('HamtCrdt', () => {
  test('new database has no changes', async () => {
    const {hamt} = setup();
    const res = hamt.hasChanges();
    expect(res).toBe(false);
  });

  describe('.get()', () => {
    test('returns undefined in empty database', async () => {
      const {hamt} = setup();
      const res1 = await hamt.get(b(1, 2, 3));
      const res2 = await hamt.get('test');
      expect(res1).toBe(undefined);
      expect(res2).toBe(undefined);
    });

    test('returns undefined in empty database', async () => {
      const {hamt} = setup();
      const res1 = await hamt.get(b(1, 2, 3));
      const res2 = await hamt.get('test');
      expect(res1).toBe(undefined);
      expect(res2).toBe(undefined);
    });
  });

  describe('.put()', () => {
    test('can store a string key', async () => {
      const {hamt} = setup();
      const res1 = await hamt.put('test', b(1, 2, 3));
      expect(res1).toBe(true);
      const res2 = await hamt.get('test');
      expect(res2).toStrictEqual(b(1, 2, 3));
    });

    test('can store a multiple keys', async () => {
      const {hamt} = setup();
      const res1 = await hamt.put('/@user1', b(1, 2, 3));
      const res2 = await hamt.put('/@user2', b(4, 5, 6));
      const res3 = await hamt.put('/@user3', b(7, 7, 7));
      expect(res1).toBe(true);
      expect(res2).toBe(true);
      expect(res3).toBe(true);
      const res4 = await hamt.get('/@user1');
      const res5 = await hamt.get('/@user2');
      const res6 = await hamt.get('/@user3');
      expect(res4).toStrictEqual(b(1, 2, 3));
      expect(res5).toStrictEqual(b(4, 5, 6));
      expect(res6).toStrictEqual(b(7, 7, 7));
    });

    test('can store into a binary key', async () => {
      const {hamt} = setup();
      const res1 = await hamt.put(b(69), b(1, 2, 3));
      expect(res1).toBe(true);
      const res2 = await hamt.get(b(69));
      expect(res2).toStrictEqual(b(1, 2, 3));
    });

    test('can store into an empty key', async () => {
      const {hamt} = setup();
      const res1 = await hamt.put(b(), b(1, 2, 3));
      expect(res1).toBe(true);
      const res2 = await hamt.get(b());
      expect(res2).toStrictEqual(b(1, 2, 3));
    });

    test('can overwrite a key', async () => {
      const {hamt} = setup();
      await hamt.put('foo', b(1, 2, 3));
      await hamt.put('foo', b(4, 5, 6));
      const res2 = await hamt.get('foo');
      expect(res2).toStrictEqual(b(4, 5, 6));
    });

    test('can add more than 16 keys', async () => {
      const {hamt} = setup();
      for (let i = 0; i < 30; i++) {
        await hamt.put('foo-' + i, b(i));
      }
      for (let i = 0; i < 30; i++) {
        const res = await hamt.get('foo-' + i);
        expect(res).toStrictEqual(b(i));
      }
    });

    test('can store any serializable value', async () => {
      const {hamt} = setup();
      const res1 = await hamt.put(b(), {foo: 123, bar: [true, false]});
      expect(res1).toBe(true);
      const res2 = await hamt.get(b());
      expect(res2).toStrictEqual({foo: 123, bar: [true, false]});
    });
  });

  describe('.has()', () => {
    test('returns false for missing keys', async () => {
      const {hamt} = setup();
      const res1 = await hamt.has('a');
      const res2 = await hamt.has('b');
      expect(res1).toBe(false);
      expect(res2).toBe(false);
    });

    test('returns true for existing keys', async () => {
      const {hamt} = setup();
      await hamt.put('a', b());
      await hamt.put('b', b(1, 2, 3));
      const res1 = await hamt.has('a');
      const res2 = await hamt.has('b');
      expect(res1).toBe(true);
      expect(res2).toBe(true);
    });
  });

  describe('.del()', () => {
    test('can delete non-existing keys', async () => {
      const {hamt} = setup();
      const res1 = await hamt.del('a');
      const res2 = await hamt.del('b');
      expect(res1).toBe(true);
      expect(res2).toBe(true);
      const res3 = await hamt.get('a');
      const res4 = await hamt.get('b');
      expect(res3).toBe(undefined);
      expect(res4).toBe(undefined);
    });

    test('can delete existing key', async () => {
      const {hamt} = setup();
      await hamt.put('a', b());
      await hamt.put('b', b(1, 2, 3));
      const res1 = await hamt.del('a');
      const res2 = await hamt.del('b');
      expect(res1).toBe(true);
      expect(res2).toBe(true);
      const res3 = await hamt.get('a');
      const res4 = await hamt.get('b');
      expect(res3).toBe(undefined);
      expect(res4).toBe(undefined);
    });
  });

  describe('.save()', () => {
    test('can persist empty HAMT', async () => {
      const {hamt, hlc, cas} = setup();
      const [cid] = await hamt.save();
      expect(cid).toBeDefined();
      const hamt2 = new HamtCrdt({
        hlc,
        cas,
      });
      await hamt2.load(cid);
    });

    test('can save a single key', async () => {
      const hlc = new HlcFactory({
        getTs: () => Math.floor(Date.now() / 1000),
        processId: 123,
      });
      const cas = new MemoryCAS();
      const hamt = new HamtCrdt({
        hlc,
        cas,
      });
      const data = 111;
      await hamt.put('a', b(data));
      const size = cas._map.size;
      expect(size).toBe(0);
      const [cid] = await hamt.save();
      expect(cas._map.size).toBe(size + 1);
      const blob = await cas.get(cid);
      const found = toArr(blob).findIndex((octet) => octet === data);
      expect(found > -1).toBe(true);
    });

    test('can load saved data', async () => {
      const {hamt, cas, hlc} = setup();
      await hamt.put('a', b(123));
      const [cid] = await hamt.save();
      const hamt2 = new HamtCrdt({
        hlc,
        cas,
      });
      const res1 = await hamt2.get('a');
      expect(res1).toBe(undefined);
      await hamt2.load(cid);
      const res2 = await hamt2.get('a');
      expect(res2).toStrictEqual(b(123));
    });

    test('can save and load more than 16 keys of data', async () => {
      const {hamt, cas, hlc} = setup();
      const keys = 1111;
      for (let i = 0; i < keys; i++) {
        await hamt.put('a:' + i, b(i, i + 1, i + 2));
      }
      const [cid, all] = await hamt.save();
      const hamt2 = new HamtCrdt({
        hlc,
        cas,
      });
      await hamt2.load(cid);
      for (let i = 0; i < keys; i++) {
        const res = await hamt2.get('a:' + i);
        expect(res).toStrictEqual(b(i, i + 1, i + 2));
      }
    });
  });

  describe('operations', () => {
    test('stores operations as keys are edited', async () => {
      const {hamt} = setup();
      expect(hamt.ops.length).toBe(0);
      await hamt.put(b(0), 0);
      expect(hamt.ops.length).toBe(1);
      expect(hamt.ops).toStrictEqual([[expect.any(Uint8Array), 0, expect.any(Array)]]);
      await hamt.put(b(1), 1);
      expect(hamt.ops.length).toBe(2);
      expect(hamt.ops).toStrictEqual([
        [expect.any(Uint8Array), 0, expect.any(Array)],
        [expect.any(Uint8Array), 1, expect.any(Array)],
      ]);
      await hamt.del(b(0));
      expect(hamt.ops.length).toBe(3);
      expect(hamt.ops).toStrictEqual([
        [expect.any(Uint8Array), 0, expect.any(Array)],
        [expect.any(Uint8Array), 1, expect.any(Array)],
        [hamt.ops[0][0], undefined, expect.any(Array)],
      ]);
    });
  });
});
