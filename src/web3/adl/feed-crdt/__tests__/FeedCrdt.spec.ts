import {HlcFactory} from '../../../hlc';
import {CidCasMemory} from '../../../store/cas/CidCasMemory';
import {CidCasStructCbor} from '../../../store/cas/CidCasStructCbor';
import {FeedFactory} from '../FeedFactory';
import {FeedFrameDto} from '../types';

const setup = () => {
  const hlcs = new HlcFactory({});
  const cas0 = new CidCasMemory();
  const cas = new CidCasStructCbor(cas0);
  const feeds = new FeedFactory({hlcs, cas});
  return {
    hlcs,
    cas0,
    cas,
    feeds,
  };
};

test('can instantiate factory', async () => {
  setup();
});

test('can create a new empty feed', async () => {
  const {feeds} = setup();
  const feed = feeds.make();
  expect(feed.getSnapshot()).toStrictEqual([]);
});

test('can persist empty feed', async () => {
  const {feeds} = setup();
  const feed = feeds.make();
  await feed.save();
  expect(feed.getSnapshot()).toStrictEqual([]);
});

test('can add entries to a new feed', async () => {
  const {feeds} = setup();
  const feed = feeds.make();
  expect(feed.getSnapshot().length).toStrictEqual(0);
  feed.add('asdf');
  expect(feed.getSnapshot().length).toStrictEqual(1);
  expect(feed.getSnapshot()[0][2]).toStrictEqual('asdf');
  feed.add(['abc']);
  expect(feed.getSnapshot().length).toStrictEqual(2);
  expect(feed.getSnapshot()[1][2]).toStrictEqual(['abc']);
});

test('can save and restore a feed', async () => {
  const {feeds, cas} = setup();
  const feed1 = feeds.make();
  feed1.add('asdf');
  feed1.add('abc');
  const cid = await feed1.save();
  const res = (await cas.get(cid)) as FeedFrameDto;
  expect(res).toBeInstanceOf(Array);
  expect(res.length).toBe(3);
  expect(res[0]).toBe(null);
  expect(res[1]).toBe(0);
  expect(res[2]).toBeInstanceOf(Array);
  const feed2 = await feeds.load(cid);
  expect(feed2.getSnapshot().length).toStrictEqual(2);
  expect(feed2.getSnapshot()[0][2]).toStrictEqual('asdf');
  expect(feed2.getSnapshot()[1][2]).toStrictEqual('abc');
});

test('can delete an entry', async () => {
  const {feeds, cas} = setup();
  const feed1 = feeds.make();
  const id1 = feed1.add('a1');
  const id2 = feed1.add('a2');
  const id3 = feed1.add('a3');
  expect(feed1.getSnapshot().length).toStrictEqual(3);
  const cid1 = await feed1.save();
  expect(feed1.getSnapshot().length).toStrictEqual(3);
  feed1.del(id1);
  expect(feed1.getSnapshot().length).toStrictEqual(2);
  expect(feed1.getSnapshot()[0][2]).toStrictEqual('a2');
  expect(feed1.getSnapshot()[1][2]).toStrictEqual('a3');
  const cid2 = await feed1.save();
  const res = await cas.get(cid2) as FeedFrameDto;
  expect(res[2].length).toStrictEqual(4);
  expect(cid2.is(cid1)).toBe(false);
  const feed2 = await feeds.load(cid2);
  expect(feed2.getSnapshot().length).toStrictEqual(2);
  feed2.del(id3);
  expect(feed2.getSnapshot().length).toStrictEqual(1);
  const cid3 = await feed2.save();
  const feed3 = await feeds.load(cid3);
  expect(feed3.getSnapshot().length).toStrictEqual(1);
  expect(feed1.getSnapshot()[0][2]).toStrictEqual('a2');
  feed3.del(id2);
  expect(feed3.getSnapshot().length).toStrictEqual(0);
  const cid4 = await feed3.save();
  const feed4 = feeds.make();
  const cidEmpty = await feed4.save();
  expect(cid4.is(cidEmpty)).toBe(false);
});

// test('delete items from another frame', async () => {});

// test('combines entries in one block if not too many entries', async () => {
//   const {feeds, cas} = setup();
//   const feed1 = feeds.make();
//   feed1.insert('entry-1');
//   feed1.insert('entry-2');
//   await feed1.save();
//   feed1.insert('entry-3');
//   feed1.insert('entry-4');
//   const [cid] = await feed1.save();
//   const res = await cas.get(cid);
//   expect(res).toBeInstanceOf(Uint8Array);
//   const tuple = decoder.decode(res) as FeedFrameDto;
//   expect(tuple[0].length).toBe(4);
// });

// test('creates a new block if last one has 25 or more entries', async () => {
//   const {feeds, cas} = setup();
//   const feed1 = feeds.make();
//   for (let i = 0; i < 25; i++) {
//     feed1.insert('entry-' + i);
//   }
//   await feed1.save();
//   feed1.insert('entry-x');
//   feed1.insert('entry-y');
//   const [cid] = await feed1.save();
//   const res = await cas.get(cid);
//   expect(res).toBeInstanceOf(Uint8Array);
//   const tuple = decoder.decode(res) as FeedFrameDto;
//   expect(tuple[0].length).toBe(2);
// });

// test('can create and read out 200 entries', async () => {
//   const {feeds} = setup();
//   const feed1 = feeds.make();
//   for (let i = 0; i < 200; i++) {
//     feed1.insert('entry-' + i);
//     await feed1.save();
//   }
//   const head = feed1.head!.cid;
//   const feed2 = await feeds.load(head);
//   while (feed2.hasMoreBlocks()) {
//     await feed2.loadMore();
//   }
//   const entries = feed2.entries.getValue();
//   expect(entries.length).toBe(200);
//   for (let i = 0; i < 200; i++) {
//     expect(entries[i][0]).toBe('entry-' + i);
//   }
// });

// test('view shows only entries, which are not deleted', async () => {
//   const {hlc, cas, feeds} = setup();
//   const feed1 = feeds.make();
//   feed1.insert('a');
//   feed1.insert('b');
//   feed1.insert('c1');
//   feed1.insert('c2');
//   feed1.insert('c3');
//   feed1.insert('c4');
//   feed1.insert('c5');
//   feed1.insert('c6');
//   feed1.insert('c7');
//   feed1.insert('c8');
//   feed1.insert('c9');
//   feed1.insert('c10');
//   feed1.insert('c11');
//   await feed1.save();
//   feed1.delete('b');
//   const [cid] = await feed1.save();
//   const feeds2 = new FeedCrdtFactory({hlc, cas});
//   const feed2 = await feeds2.load(cid);
//   await feed2.loadAll();
//   const list = feed2.entries.getValue();
//   expect(list[0][0]).toBe('a');
//   expect(list[1][0]).toBe('c1');
//   expect(list[2][0]).toBe('c2');
//   expect(list[3][0]).toBe('c3');
//   expect(list[4][0]).toBe('c4');
//   expect(list[5][0]).toBe('c5');
//   expect(list[6][0]).toBe('c6');
//   expect(list[7][0]).toBe('c7');
//   expect(list[8][0]).toBe('c8');
//   expect(list[9][0]).toBe('c9');
//   expect(list[10][0]).toBe('c10');
//   expect(list[11][0]).toBe('c11');
// });
