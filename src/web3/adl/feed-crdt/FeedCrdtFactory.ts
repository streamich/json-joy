import {FeedCrdt, FeedCrdtDependencies} from './FeedCrdt.js';
import type {CID} from 'multiformats';

export interface FeedCrdtFactoryDependencies extends FeedCrdtDependencies {}

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
