/** @jest-environment node */
import {MemoryLevel} from 'memory-level';
import {decoder} from '../../../../util/cbor';
import {HlcFactory} from '../../../hlc';
import {LevelCAS} from '../../LevelCAS';
import {FeedCrdtFactory} from '../FeedCrdtFactory.js';
import {FeedFrameDto} from '../types.js';

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
  const feeds = new FeedCrdtFactory({hlc, cas});
  return {
    hlc,
    db,
    cas,
    feeds,
  };
};

test('can instantiate factory', async () => {
  setup();
});

test('can create a new feed', async () => {
  const {feeds} = setup();
  const feed = feeds.make();
  expect(feed.entries.getValue()).toStrictEqual([]);
});

test('can add entries to a new feed', async () => {
  const {feeds} = setup();
  const feed = feeds.make();
  expect(feed.entries.getValue().length).toStrictEqual(0);
  feed.insert('asdf');
  expect(feed.entries.getValue().length).toStrictEqual(1);
  expect(feed.entries.getValue()[0][0]).toStrictEqual('asdf');
  feed.insert('abc');
  expect(feed.entries.getValue().length).toStrictEqual(2);
  expect(feed.entries.getValue()[1][0]).toStrictEqual('abc');
});

test('can save and restore a feed', async () => {
  const {feeds, cas} = setup();
  const feed1 = feeds.make();
  feed1.insert('asdf');
  feed1.insert('abc');
  const [cid] = await feed1.save();
  const res = await cas.get(cid);
  expect(res).toBeInstanceOf(Uint8Array);
  expect(res.length > 0).toBe(true);
  const feed2 = await feeds.load(cid);
  expect(feed2.entries.getValue().length).toStrictEqual(2);
  expect(feed2.entries.getValue()[0][0]).toStrictEqual('asdf');
  expect(feed2.entries.getValue()[1][0]).toStrictEqual('abc');
});

test('can delete an entry', async () => {
  const {feeds, cas} = setup();
  const feed1 = feeds.make();
  feed1.insert('asdf');
  feed1.insert('abc');
  feed1.delete('asdf');
  expect(feed1.entries.getValue().length).toStrictEqual(1);
  const [cid] = await feed1.save();
  const res = await cas.get(cid);
  expect(res).toBeInstanceOf(Uint8Array);
  expect(res.length > 0).toBe(true);
  const feed2 = await feeds.load(cid);
  expect(feed2.entries.getValue().length).toStrictEqual(1);
  expect(feed2.entries.getValue()[0][0]).toStrictEqual('abc');
});

test('combines entries in one block if not too many entries', async () => {
  const {feeds, cas} = setup();
  const feed1 = feeds.make();
  feed1.insert('entry-1');
  feed1.insert('entry-2');
  await feed1.save();
  feed1.insert('entry-3');
  feed1.insert('entry-4');
  const [cid] = await feed1.save();
  const res = await cas.get(cid);
  expect(res).toBeInstanceOf(Uint8Array);
  const tuple = decoder.decode(res) as FeedFrameDto;
  expect(tuple[0].length).toBe(4);
});

test('creates a new block if last one has 25 or more entries', async () => {
  const {feeds, cas} = setup();
  const feed1 = feeds.make();
  for (let i = 0; i < 25; i++) {
    feed1.insert('entry-' + i);
  }
  await feed1.save();
  feed1.insert('entry-x');
  feed1.insert('entry-y');
  const [cid] = await feed1.save();
  const res = await cas.get(cid);
  expect(res).toBeInstanceOf(Uint8Array);
  const tuple = decoder.decode(res) as FeedFrameDto;
  expect(tuple[0].length).toBe(2);
});

test('can create and read out 200 entries', async () => {
  const {feeds} = setup();
  const feed1 = feeds.make();
  for (let i = 0; i < 200; i++) {
    feed1.insert('entry-' + i);
    await feed1.save();
  }
  const head = feed1.head!.cid;
  const feed2 = await feeds.load(head);
  while (feed2.hasMoreBlocks()) {
    await feed2.loadMore();
  }
  const entries = feed2.entries.getValue();
  expect(entries.length).toBe(200);
  for (let i = 0; i < 200; i++) {
    expect(entries[i][0]).toBe('entry-' + i);
  }
});

test('view shows only entries, which are not deleted', async () => {
  const {hlc, cas, feeds} = setup();
  const feed1 = feeds.make();
  feed1.insert('a');
  feed1.insert('b');
  feed1.insert('c1');
  feed1.insert('c2');
  feed1.insert('c3');
  feed1.insert('c4');
  feed1.insert('c5');
  feed1.insert('c6');
  feed1.insert('c7');
  feed1.insert('c8');
  feed1.insert('c9');
  feed1.insert('c10');
  feed1.insert('c11');
  await feed1.save();
  feed1.delete('b');
  const [cid] = await feed1.save();
  const feeds2 = new FeedCrdtFactory({hlc, cas});
  const feed2 = await feeds2.load(cid);
  await feed2.loadAll();
  const list = feed2.entries.getValue();
  expect(list[0][0]).toBe('a');
  expect(list[1][0]).toBe('c1');
  expect(list[2][0]).toBe('c2');
  expect(list[3][0]).toBe('c3');
  expect(list[4][0]).toBe('c4');
  expect(list[5][0]).toBe('c5');
  expect(list[6][0]).toBe('c6');
  expect(list[7][0]).toBe('c7');
  expect(list[8][0]).toBe('c8');
  expect(list[9][0]).toBe('c9');
  expect(list[10][0]).toBe('c10');
  expect(list[11][0]).toBe('c11');
});
