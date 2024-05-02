import {s, type NodeBuilder, type nodes} from "../../json-crdt-patch";
import type {ModelApi} from "../model";
import type {JsonNode} from "../nodes";
import type {ExtensionApi, ExtensionJsonNode} from "./types";

export class Extension<
  Id extends number,
  Node extends JsonNode,
  ENode extends ExtensionJsonNode,
  EApi extends ExtensionApi<ENode>,
  ESchema extends NodeBuilder,
> {
  constructor(
    public readonly id: Id,
    public readonly name: string,
    public readonly schema: (...args: any[]) => ESchema,
    public readonly Node: new (data: Node) => ENode,
    public readonly Api: new (node: ENode, api: ModelApi) => EApi,
  ) {}

  public new(...args: any[]): nodes.ext<Id, ESchema> {
    return s.ext<Id, ESchema>(this.id, this.schema(...args));
  }
}
