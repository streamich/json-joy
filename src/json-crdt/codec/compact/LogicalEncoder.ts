import {ITimestamp} from '../../../json-crdt-patch/clock';
import {ClockEncoder} from '../../../json-crdt-patch/codec/clock/ClockEncoder';
import {Model} from '../../model';
import {AbstractEncoder} from './AbstractEncoder';

export class LogicalEncoder extends AbstractEncoder {
  protected clock!: ClockEncoder;

  public encode(model: Model): unknown[] {
    model.advanceClocks();
    this.clock = new ClockEncoder(model.clock);
    const snapshot: unknown[] = [null];
    this.encodeRoot(snapshot, model.root);
    snapshot[0] = this.clock.toJson();
    return snapshot;
  }

  protected ts(arr: unknown[], ts: ITimestamp): void {
    const relativeId = this.clock.append(ts);
    relativeId.push(arr);
  }
}
