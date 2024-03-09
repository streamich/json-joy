import type {Cid} from '../../multiformats';
import type {CidCasStruct} from '../../store/cas/CidCasStruct';
import type {FeedFrameDto, FeedOp} from './types';

export class FeedFrame {
  public static async read(cid: Cid, cas: CidCasStruct): Promise<FeedFrame> {
    const dto = (await cas.get(cid)) as FeedFrameDto;
    const frame = new FeedFrame(cid, dto);
    return frame;
  }

  public static async create(data: FeedFrameDto, cas: CidCasStruct): Promise<FeedFrame> {
    const cid = await cas.put(data);
    const frame = new FeedFrame(cid, data);
    return frame;
  }

  public prev: FeedFrame | null = null;

  constructor(
    public cid: Cid,
    public data: FeedFrameDto,
  ) {}

  public prevCid(): Uint8Array | null {
    return this.data[0];
  }

  public seq(): number {
    return this.data[1];
  }

  public ops(): FeedOp[] {
    return this.data[2];
  }
}
