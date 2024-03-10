import {Feed, type FeedDependencies} from './Feed';
import type {Cid} from '../../multiformats';

export interface FeedFactoryDependencies extends FeedDependencies {}

export class FeedFactory {
  constructor(protected readonly deps: FeedFactoryDependencies) {}

  public make(): Feed {
    const feed = new Feed(this.deps);
    return feed;
  }

  public async load(cid: Cid): Promise<Feed> {
    const feed = new Feed(this.deps);
    await feed.loadHead(cid);
    return feed;
  }
}
