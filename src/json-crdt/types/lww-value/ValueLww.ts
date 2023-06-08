import {compare, ITimestampStruct, toDisplayString} from '../../../json-crdt-patch/clock';
import {SESSION} from '../../../json-crdt-patch/constants';
import {printTree} from '../../../util/print/printTree';
import type {JsonNode} from '../../types';
import type {Model} from '../../model';
import type {Printable} from '../../../util/print/types';

export class ValueLww implements JsonNode, Printable {
  constructor(public readonly doc: Model, public readonly id: ITimestampStruct, public val: ITimestampStruct) {}

  public set(val: ITimestampStruct): ITimestampStruct | undefined {
    if (compare(val, this.val) <= 0 && this.val.sid !== SESSION.SYSTEM) return;
    const oldVal = this.val;
    this.val = val;
    return oldVal;
  }

  public node(): JsonNode {
    return this.child()!;
  }

  public view(): unknown {
    return this.node().view();
  }

  public children(callback: (node: JsonNode) => void) {
    callback(this.node());
  }

  public child() {
    return this.doc.index.get(this.val)!;
  }

  public container(): JsonNode | undefined {
    const child = this.node();
    return child ? child.container() : undefined;
  }

  public toString(tab: string = ''): string {
    const node = this.node();
    const header = this.constructor.name + ' ' + toDisplayString(this.id);
    return header + printTree(tab, [(tab) => (node ? node.toString(tab) : toDisplayString(this.val))]);
  }
}
