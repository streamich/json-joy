import {HlcFactory} from '../../../hlc';
import {CidCasMemory} from '../../../store/cas/CidCasMemory';
import {CidCasStructCbor} from '../../../store/cas/CidCasStructCbor';
import {Feed} from '../Feed';
import {FeedFactory, FeedFactoryDependencies} from '../FeedFactory';

interface SetupOpts {
  factory?: Pick<FeedFactoryDependencies, 'opsPerFrame'>;
}

const setup = ({factory}: SetupOpts = {}) => {
  const hlcs = new HlcFactory({});
  const cas0 = new CidCasMemory();
  const cas = new CidCasStructCbor(cas0);
  const feeds = new FeedFactory({...factory, hlcs, cas});
  return {
    hlcs,
    cas0,
    cas,
    feeds,
  };
};

describe('can merge', () => {
  test('when common parent is null', async () => {
    const {feeds, cas} = setup();
    const feed = feeds.make();
    feed.add({foo: 'bar'});
    const cid = await feed.save();
    const left = await feeds.load(cid);
    const right = await feeds.load(cid);
    expect(left.getSnapshot().length).toBe(1);
    expect(left.getSnapshot()).toStrictEqual(right.getSnapshot());
    left.add('left1');
    left.add('left2');
    right.add('right1');
    const leftCid = await left.save();
    const rightCid = await right.save();
    const res = await Feed.merge(cas, leftCid, rightCid);
    const mergedFeed = await feeds.load(res[0].cid);
    expect(mergedFeed.getSnapshot().length).toBe(4);
    expect(mergedFeed.getSnapshot()[0][2]).toStrictEqual({foo: 'bar'});
    expect(mergedFeed.getSnapshot()[1][2]).toStrictEqual('left1');
    expect(mergedFeed.getSnapshot()[2][2]).toStrictEqual('left2');
    expect(mergedFeed.getSnapshot()[3][2]).toStrictEqual('right1');
  });

  const generateCommonParent = async () => {
    const deps = setup({factory: {opsPerFrame: 3}});
    const common = deps.feeds.make();
    common.add('c1');
    common.add('c2');
    common.add('c3');
    await common.save();
    common.add('c4');
    common.add('c5');
    common.add('c6');
    await common.save();
    common.add('c7');
    common.add('c8');
    common.add('c9');
    await common.save();
    return {...deps, common};
  };

  test('when both sides one step from common parent', async () => {
    const {feeds, cas, common} = await generateCommonParent();
    const left = await feeds.load(common.cid()!);
    left.add('l1');
    await left.save();
    const right = await feeds.load(common.cid()!);
    right.add('r1');
    await right.save();
    const frames = await Feed.merge(cas, left.cid()!, right.cid()!);
    const merged = await feeds.load(frames[frames.length - 1].cid);
    await merged.loadAll();
    expect(merged.getSnapshot().map(([, , data]) => data)).toStrictEqual([
      'c1',
      'c2',
      'c3',
      'c4',
      'c5',
      'c6',
      'c7',
      'c8',
      'c9',
      'l1',
      'r1',
    ]);
  });

  test('when left side is further ahead', async () => {
    const {feeds, cas, common} = await generateCommonParent();
    const left = await feeds.load(common.cid()!);
    left.add('l1');
    left.add('l2');
    left.add('l3');
    await left.save();
    left.add('l4');
    left.add('l5');
    left.add('l6');
    await left.save();
    left.add('l7');
    await left.save();
    const right = await feeds.load(common.cid()!);
    right.add('r1');
    right.add('r2');
    await right.save();
    const frames = await Feed.merge(cas, left.cid()!, right.cid()!, 3);
    expect(frames.length).toBe(3);
    const merged = await feeds.load(frames[frames.length - 1].cid);
    await merged.loadAll();
    expect(merged.getSnapshot().map(([, , data]) => data)).toStrictEqual([
      'c1',
      'c2',
      'c3',
      'c4',
      'c5',
      'c6',
      'c7',
      'c8',
      'c9',
      'l1',
      'l2',
      'l3',
      'l4',
      'l5',
      'l6',
      'l7',
      'r1',
      'r2',
    ]);
  });

  test('when right side has not advanced', async () => {
    const {feeds, cas, common} = await generateCommonParent();
    const left = await feeds.load(common.cid()!);
    left.add('l1');
    left.add('l2');
    left.add('l3');
    await left.save();
    left.add('l4');
    left.add('l5');
    left.add('l6');
    await left.save();
    left.add('l7');
    await left.save();
    const frames = await Feed.merge(cas, left.cid()!, common.cid()!, 3);
    expect(frames.length).toBe(3);
    const merged = await feeds.load(frames[frames.length - 1].cid);
    await merged.loadAll();
    expect(merged.getSnapshot().map(([, , data]) => data)).toStrictEqual([
      'c1',
      'c2',
      'c3',
      'c4',
      'c5',
      'c6',
      'c7',
      'c8',
      'c9',
      'l1',
      'l2',
      'l3',
      'l4',
      'l5',
      'l6',
      'l7',
    ]);
  });

  test('when right side is further ahead', async () => {
    const {feeds, cas, common} = await generateCommonParent();
    const left = await feeds.load(common.cid()!);
    left.add('l1');
    left.add('l2');
    left.add('l3');
    await left.save();
    const right = await feeds.load(common.cid()!);
    right.add('r1');
    right.add('r2');
    right.add('r3');
    await right.save();
    right.add('r4');
    await right.save();
    const frames = await Feed.merge(cas, left.cid()!, right.cid()!, 3);
    expect(frames.length).toBe(3);
    const merged = await feeds.load(frames[frames.length - 1].cid);
    await merged.loadAll();
    expect(merged.getSnapshot().map(([, , data]) => data)).toStrictEqual([
      'c1',
      'c2',
      'c3',
      'c4',
      'c5',
      'c6',
      'c7',
      'c8',
      'c9',
      'l1',
      'l2',
      'l3',
      'r1',
      'r2',
      'r3',
      'r4',
    ]);
  });

  test('when right side is further ahead and applied first', async () => {
    const {feeds, cas, common} = await generateCommonParent();
    const right = await feeds.load(common.cid()!);
    right.add('r1');
    right.add('r2');
    right.add('r3');
    await right.save();
    right.add('r4');
    await right.save();
    const left = await feeds.load(common.cid()!);
    left.add('l1');
    left.add('l2');
    left.add('l3');
    await left.save();
    const frames = await Feed.merge(cas, left.cid()!, right.cid()!, 3);
    expect(frames.length).toBe(3);
    const merged = await feeds.load(frames[frames.length - 1].cid);
    await merged.loadAll();
    expect(merged.getSnapshot().map(([, , data]) => data)).toStrictEqual([
      'c1',
      'c2',
      'c3',
      'c4',
      'c5',
      'c6',
      'c7',
      'c8',
      'c9',
      'r1',
      'r2',
      'r3',
      'r4',
      'l1',
      'l2',
      'l3',
    ]);
  });

  test('when left side has not advanced', async () => {
    const {feeds, cas, common} = await generateCommonParent();
    const right = await feeds.load(common.cid()!);
    right.add('r1');
    right.add('r2');
    right.add('r3');
    await right.save();
    right.add('r4');
    right.add('r5');
    right.add('r6');
    await right.save();
    right.add('r7');
    await right.save();
    const frames = await Feed.merge(cas, common.cid()!, right.cid()!, 3);
    expect(frames.length).toBe(3);
    const merged = await feeds.load(frames[frames.length - 1].cid);
    await merged.loadAll();
    expect(merged.getSnapshot().map(([, , data]) => data)).toStrictEqual([
      'c1',
      'c2',
      'c3',
      'c4',
      'c5',
      'c6',
      'c7',
      'c8',
      'c9',
      'r1',
      'r2',
      'r3',
      'r4',
      'r5',
      'r6',
      'r7',
    ]);
  });
});
