import {ITimestamp, ServerTimestamp} from '../../../json-crdt-patch/clock';
import {Model} from '../../model';
import {AbstractDecoder} from './AbstractDecoder';

export class ServerDecoder extends AbstractDecoder {
  protected time!: number;

  public decode(data: Uint8Array): Model {
    this.reset(data);
    this.time = this.vuint57();
    const doc = (this.doc = Model.withServerClock(this.time));
    this.decodeRoot(doc);
    return doc;
  }

  protected ts(): ITimestamp {
    const timeDiff = this.vuint57();
    return new ServerTimestamp(this.time - timeDiff);
  }
}
