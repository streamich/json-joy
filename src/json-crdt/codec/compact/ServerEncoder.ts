import {ITimestamp} from '../../../json-crdt-patch/clock';
import {Model} from '../../model';
import {AbstractEncoder} from './AbstractEncoder';

export class ServerEncoder extends AbstractEncoder {
  protected time!: number;

  public encode(doc: Model): unknown[] {
    this.time = doc.clock.time;
    const snapshot: unknown[] = [this.time];
    this.encodeRoot(snapshot, doc.root);
    return snapshot;
  }

  protected ts(arr: unknown[], ts: ITimestamp): void {
    arr.push(this.time - ts.time);
  }
}
