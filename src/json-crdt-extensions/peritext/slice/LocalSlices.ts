import {Slices} from './Slices';
import type {ITimestampStruct} from '../../../json-crdt-patch';

export class LocalSlices extends Slices {
  public del(id: ITimestampStruct): void {
    super.del(id);
    if (Math.random() < 0.1) this.set.removeTombstones();
  }
}
