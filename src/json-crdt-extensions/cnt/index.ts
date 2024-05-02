import {ExtensionId, ExtensionName} from '../constants';
import {NodeApi} from '../../json-crdt/model/api/nodes';
import {ExtNode} from '../../json-crdt/extensions/ExtNode';
import {s, type ExtensionDefinition, type ObjNode} from '../../json-crdt';
import type {ExtensionApi} from '../../json-crdt';

const MNEMONIC = ExtensionName[ExtensionId.cnt];

class CntNode extends ExtNode<ObjNode> {
  // ------------------------------------------------------------------ ExtNode

  public name(): string {
    return MNEMONIC;
  }

  public view(): number {
    const obj = this.data.view();
    let sum: number = 0;
    for (const key in obj) sum += Number(obj[key]);
    return sum;
  }
}

class CntApi extends NodeApi<CntNode> implements ExtensionApi<CntNode> {
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

export const CntExt: ExtensionDefinition<ObjNode, CntNode, CntApi> = {
  id: ExtensionId.cnt,
  name: MNEMONIC,
  new: (value?: number, sid: number = 0) => s.ext(ExtensionId.cnt, s.obj({[sid]: s.jsonCon(value)})),
  Node: CntNode,
  Api: CntApi,
};
