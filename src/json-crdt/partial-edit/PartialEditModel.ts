import type {ITimestampStruct} from '../../json-crdt-patch/clock';
import {Model} from '../model/Model';

export class PartialEditModel extends Model {
  public deletes: ITimestampStruct[] = [];

  protected deleteNodeTree(value: ITimestampStruct) {
    this.deletes.push(value);
    super.deleteNodeTree(value);
  }
}
