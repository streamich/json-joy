import {ITimestamp} from '../../../json-crdt-patch/clock';
import {ClockDecoder} from '../../../json-crdt-patch/codec/clock/ClockDecoder';
import {Model} from '../../model';
import {DocRootType} from '../../types/lww-doc-root/DocRootType';
import {AbstractDecoder} from './AbstractDecoder';

export class LogicalDecoder extends AbstractDecoder {
  protected clockDecoder!: ClockDecoder;

  public decode(data: unknown[]): Model {
    this.clockDecoder = ClockDecoder.fromArr(data[0] as number[]);
    const doc = Model.withLogicalClock(this.clockDecoder.clock);
    const rootId = this.ts(data, 1);
    const rootNode = data[3] ? this.decodeNode(doc, data[3]) : null;
    doc.root = new DocRootType(doc, rootId, rootNode);
    return doc;
  }

  protected ts(arr: unknown[], index: number): ITimestamp {
    const sessionIndex = arr[index] as number;
    const timeDiff = arr[index + 1] as number;
    return this.clockDecoder.decodeId(sessionIndex, timeDiff);
  }
}
