import {JsonNode} from '../../types';
import {ModelApi} from './ModelApi';

export class NodeApi<Node extends JsonNode, View = unknown> {
  constructor(protected readonly api: ModelApi, protected readonly node: Node) {}

  public commit(): void {
    this.api.commit();
  }

  public toView(): View {
    return this.node.toJson() as unknown as View;
  }
}
