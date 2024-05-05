import {type NodeBuilder, s, type nodes} from '../../json-crdt-patch';
import type {ExtNode} from './ExtNode';
import type {ModelApi} from '../model';
import type {JsonNode} from '../nodes';
import type {JsonNodeToSchema} from '../schema/types';
import type {ExtApi} from './types';

export type AnyExtension = Extension<any, any, any, any, any, any>;

export class Extension<
  Id extends number,
  DataNode extends JsonNode,
  ENode extends ExtNode<DataNode, any>,
  EApi extends ExtApi<ENode>,
  DataArgs extends any[] = any[],
  DataSchema extends NodeBuilder = JsonNodeToSchema<DataNode>,
> {
  constructor(
    public readonly id: Id,
    public readonly name: string,
    public readonly Node: new (data: DataNode) => ENode,
    public readonly Api: new (node: ENode, api: ModelApi<any>) => EApi,
    public readonly schema: (...args: DataArgs) => DataSchema,
  ) {}

  public new(...args: DataArgs): nodes.ext<Id, DataSchema> {
    return s.ext<Id, DataSchema>(this.id, this.schema(...args));
  }
}
