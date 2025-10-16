import type {ITimestampStruct} from '../../json-crdt-patch/clock';
import {Model} from '../model/Model';

export class PartialEditModel extends Model {
  public deletes: ITimestampStruct[] = [];

  protected _gcTree(value: ITimestampStruct) {
    this.deletes.push(value);
    super._gcTree(value);
  }
}
