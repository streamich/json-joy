import {JsonNode} from 'json-joy/lib/json-crdt';

export class NodeRef<N extends JsonNode = JsonNode> {
  constructor(
    public readonly node: N,
    public readonly parent: NodeRef | null,
    public step: string,
  ) {}
}

const map = new WeakMap<JsonNode, NodeRef>();

export const nodeRef = <N extends JsonNode>(node: N, parent: NodeRef | null, step: string) => {
  try {
    const ref = map.get(node);
    if (ref) return ref as NodeRef<N>;
    const newRef = new NodeRef(node, parent, step);
    map.set(node, newRef);
    return newRef as NodeRef<N>;
  } catch {
    return undefined;
  }
};
