import {Anchor} from './constants';
import {Point} from './point/Point';
import {printTree} from '../../util/print/printTree';
import {ArrNode, StrNode} from '../../json-crdt/nodes';
import {type ITimestampStruct} from '../../json-crdt-patch/clock';
import type {Model} from '../../json-crdt/model';
import type {Printable} from '../../util/print/types';

export class Peritext implements Printable {
  constructor(public readonly model: Model, public readonly str: StrNode, slices: ArrNode) {}

  public point(id: ITimestampStruct, anchor: Anchor = Anchor.After): Point {
    return new Point(this, id, anchor);
  }

  public pointAt(pos: number, anchor: Anchor = Anchor.Before): Point {
    const str = this.str;
    const id = str.find(pos);
    if (!id) return this.point(str.id, Anchor.After);
    return this.point(id, anchor);
  }

  // ---------------------------------------------------------------- Printable

  public toString(tab: string = ''): string {
    const nl = () => '';
    return (
      this.constructor.name +
      printTree(tab, [
        (tab) => this.str.toString(tab),
      ])
    );
  }
}
