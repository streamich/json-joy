import {delayed} from '../../json-crdt-patch/builder/DelayedValueBuilder';
import {ext} from '../../json-crdt/extensions';
import {ExtensionId} from '../constants';
import {printTree} from '../../util/print/printTree';
import {NodeApi} from '../../json-crdt/model/api/nodes';
import type {ExtensionDefinition, ObjNode} from '../../json-crdt';
import type {ITimestampStruct} from '../../json-crdt-patch/clock';
import type {ExtensionJsonNode, JsonNode} from '../../json-crdt';
import type {Printable} from '../../util/print/types';
import type {ExtensionApi} from '../../json-crdt';

const name = 'gcnt';

class GcntNode implements ExtensionJsonNode, Printable {
  public readonly id: ITimestampStruct;

  constructor(public readonly data: ObjNode) {
    this.id = data.id;
  }

  // -------------------------------------------------------- ExtensionJsonNode

  public name(): string {
    return name;
  }

  public view(): number {
    const obj = this.data.view();
    let sum: number = 0;
    for (const key in obj) sum += Number(obj[key]);
    return sum;
  }

  public children(callback: (node: JsonNode) => void): void {}

  public child?(): JsonNode | undefined {
    return this.data;
  }

  public container(): JsonNode | undefined {
    return this.data.container();
  }

  public api: undefined | unknown = undefined;

  // ---------------------------------------------------------------- Printable

  public toString(tab?: string): string {
    return `${this.name()} (${this.view()})` + printTree(tab, [(tab) => this.data.toString(tab)]);
  }
}

class GcntApi extends NodeApi<GcntNode> implements ExtensionApi<GcntNode> {
  public inc(increment: number): this {
    const {api, node} = this;
    const sid = api.model.clock.sid;
    const sidStr = sid.toString(36);
    const value = Number(node.data.get(sidStr)?.view() ?? 0);
    const newValue = value + increment;
    const obj = api.wrap(node.data);
    obj.set({
      [sidStr]: newValue,
    });
    return this;
  }
}

export const GcntExt: ExtensionDefinition<ObjNode, GcntNode, GcntApi> = {
  id: ExtensionId.gcnt,
  name,
  new: (value?: number, sid: number = 0) =>
    ext(
      ExtensionId.gcnt,
      delayed((builder) => builder.constOrJson(value ? {[sid]: value} : {})),
    ),
  Node: GcntNode,
  Api: GcntApi,
};
