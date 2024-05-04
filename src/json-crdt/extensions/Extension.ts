import {NodeBuilder, s, type nodes} from '../../json-crdt-patch';
import {ExtensionNode} from './ExtensionNode';
import type {ModelApi} from '../model';
import type {JsonNode} from '../nodes';
import type {JsonNodeToSchema} from '../schema/types';
import type {ExtensionApi} from './types';

export type AnyExtension = Extension<any, any, any, any, any, any>;

export class Extension<
  Id extends number,
  DataNode extends JsonNode,
  ExtNode extends ExtensionNode<DataNode, any>,
  ExtApi extends ExtensionApi<ExtNode>,
  DataArgs extends any[] = any[],
  DataSchema extends NodeBuilder = JsonNodeToSchema<DataNode>,
> {
  constructor(
    public readonly id: Id,
    public readonly name: string,
    public readonly Node: new (data: DataNode) => ExtNode,
    public readonly Api: new (node: ExtNode, api: ModelApi<any>) => ExtApi,
    public readonly schema: (...args: DataArgs) => DataSchema,
  ) {}

  public new(...args: DataArgs): nodes.ext<Id, DataSchema> {
    return s.ext<Id, DataSchema>(this.id, this.schema(...args));
  }
}
