import {Feed, FeedDependencies} from './Feed';

export interface FeedCrdtFactoryDependencies extends FeedDependencies {}

export class FeedCrdtFactory {
  constructor(protected readonly deps: FeedCrdtFactoryDependencies) {}

  public make(): FeedCrdt {
    const feed = new FeedCrdt(this.deps);
    return feed;
  }

  public async load(cid: CID): Promise<FeedCrdt> {
    const feed = new FeedCrdt(this.deps);
    await feed.loadHead(cid);
    return feed;
  }
}
