import {Slices} from './Slices';
import type {ITimestampStruct} from '../../../json-crdt-patch';

export class LocalSlices<T = string> extends Slices<T> {
  public del(id: ITimestampStruct): void {
    super.del(id);
    if (Math.random() < 0.1) this.set.rmTombstones();
  }

  public toStringName(): string {
    return 'LocalSlices';
  }
}
