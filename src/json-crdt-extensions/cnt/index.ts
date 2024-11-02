import {ExtensionId, ExtensionName} from '../constants';
import {NodeApi} from '../../json-crdt/model/api/nodes';
import {ExtNode} from '../../json-crdt/extensions/ExtNode';
import {Extension} from '../../json-crdt/extensions/Extension';
import {NodeBuilder, type nodes, s, type ObjNode} from '../../json-crdt';
import type {ExtApi} from '../../json-crdt';

const MNEMONIC = ExtensionName[ExtensionId.cnt];

class CntNode extends ExtNode<ObjNode, number> {
  public readonly extId = ExtensionId.cnt;

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

class CntApi extends NodeApi<CntNode> implements ExtApi<CntNode> {
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

const create = (value?: any, sid: any = 0) =>
  new NodeBuilder((builder) => {
    if (!sid) sid = builder.clock.sid;
    const schema =
      value === undefined
        ? s.map<nodes.con<number>>({})
        : s.map<nodes.con<number>>({[sid.toString(36)]: s.con(value ?? 0)});
    return schema.build(builder);
  });

export const cnt = new Extension(ExtensionId.cnt, MNEMONIC, CntNode, CntApi, create);
