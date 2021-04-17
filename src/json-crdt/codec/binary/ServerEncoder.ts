import {ITimestamp} from '../../../json-crdt-patch/clock';
import {Model} from '../../model';
import {AbstractEncoder} from './AbstractEncoder';

export class ServerEncoder extends AbstractEncoder {
  protected time!: number;

  public encode(doc: Model): Uint8Array {
    this.reset();
    this.time = doc.clock.time;
    this.vuint57(this.time);
    this.encodeRoot(doc.root);
    return this.flush();
  }

  protected ts(ts: ITimestamp) {
    const timeDiff = this.time - ts.time;
    this.vuint57(timeDiff);
  }
}
