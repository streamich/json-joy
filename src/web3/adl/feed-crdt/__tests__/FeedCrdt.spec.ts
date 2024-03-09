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

test('delete items from another frame', async () => {
  const {feeds, cas} = setup();
  const feed1 = feeds.make();
  feed1.opsPerFrameThreshold = 5;
  const id1 = feed1.add('a1');
  const id2 = feed1.add('a2');
  const id3 = feed1.add('a3');
  const id4 = feed1.add('a4');
  const id5 = feed1.add('a5');
  const id6 = feed1.add('a6');
  const id7 = feed1.add('a7');
  const id8 = feed1.add('a8');
  const cid1 = await feed1.save();
  const id9 = feed1.add('a9');
  const id10 = feed1.add('a10');
  const id11 = feed1.add('a11');
  const id12 = feed1.add('a12');
  const id13 = feed1.add('a13');
  const id14 = feed1.add('a14');
  const cid2 = await feed1.save();
  const frame = await cas.get(cid2) as FeedFrameDto;
  expect(frame[1]).toBe(1);
  expect(feed1.getSnapshot()[1][2]).toBe('a2');
  await feed1.del(id2);
  expect(feed1.getSnapshot()[1][2]).toBe('a3');
  const cid3 = await feed1.save();
  const feed2 = await feeds.load(cid3);
  await feed2.loadAll();
  expect(feed2.getSnapshot()[1][2]).toBe('a3');
});

test('combines entries in one block, if operation count is withing a threshold', async () => {
  const {feeds, cas} = setup();
  const feed1 = feeds.make();
  feed1.add('entry-1');
  feed1.add('entry-2');
  await feed1.save();
  feed1.add('entry-3');
  feed1.add('entry-4');
  const cid = await feed1.save();
  const res = await cas.get(cid) as FeedFrameDto
  expect(res[2].length).toBe(4);
});

test('creates a new block if last one has 25 or more entries', async () => {
  const {feeds, cas} = setup();
  const feed1 = feeds.make();
  for (let i = 0; i < feed1.opsPerFrameThreshold; i++) {
    feed1.add('entry-' + i);
  }
  await feed1.save();
  feed1.add('entry-x');
  feed1.add('entry-y');
  const cid = await feed1.save();
  const res = await cas.get(cid) as FeedFrameDto;
  expect(res[2].length).toBe(2);
});

test('can create and read out 200 entries', async () => {
  const {feeds} = setup();
  const feed1 = feeds.make();
  for (let i = 0; i < 200; i++) {
    feed1.add('entry-' + i);
    await feed1.save();
  }
  const cid = feed1.cid()!;
  const feed2 = await feeds.load(cid);
  await feed2.loadAll();
  const entries = feed2.getSnapshot();
  expect(entries.length).toBe(200);
  for (let i = 0; i < 200; i++) {
    expect(entries[i][2]).toBe('entry-' + i);
  }
});

test('view shows only entries, which are not deleted', async () => {
  const {hlcs, cas, feeds} = setup();
  const feed1 = feeds.make();
  feed1.add('a');
  const bId = feed1.add('b');
  feed1.add('c1');
  feed1.add('c2');
  feed1.add('c3');
  feed1.add('c4');
  feed1.add('c5');
  feed1.add('c6');
  feed1.add('c7');
  feed1.add('c8');
  feed1.add('c9');
  feed1.add('c10');
  feed1.add('c11');
  await feed1.save();
  feed1.del(bId);
  const cid = await feed1.save();
  const feeds2 = new FeedFactory({hlcs, cas});
  const feed2 = await feeds2.load(cid);
  await feed2.loadAll();
  const list = feed2.getSnapshot();
  expect(list[0][2]).toBe('a');
  expect(list[1][2]).toBe('c1');
  expect(list[2][2]).toBe('c2');
  expect(list[3][2]).toBe('c3');
  expect(list[4][2]).toBe('c4');
  expect(list[5][2]).toBe('c5');
  expect(list[6][2]).toBe('c6');
  expect(list[7][2]).toBe('c7');
  expect(list[8][2]).toBe('c8');
  expect(list[9][2]).toBe('c9');
  expect(list[10][2]).toBe('c10');
  expect(list[11][2]).toBe('c11');
});
