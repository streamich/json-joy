import type {Cid} from '../../multiformats';
import type {FeedFrameDto} from './types';

export class FeedFrame {
  public prev: FeedFrame | null = null;
  constructor(public cid: Cid, public data: FeedFrameDto) {}
}
