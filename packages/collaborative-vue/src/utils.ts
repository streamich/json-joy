import type {NodeApi} from 'json-joy/lib/json-crdt';
import type {ApiPath} from 'json-joy/lib/json-crdt/model/api/types';

/**
 * A way to select a nested node from a root node — either a path (resolved with
 * `node.find(path)`) or a function that derives the node from the root.
 */
export type ModelSelector<Top extends NodeApi<any> = NodeApi<any>, Selected extends NodeApi<any> = NodeApi<any>> =
  | ApiPath
  | ((model: Top) => Selected);

export const selectNode = <Top extends NodeApi<any> = NodeApi<any>, Selected extends NodeApi<any> = NodeApi<any>>(
  model: Top,
  selector: ModelSelector<Top, Selected>,
): Selected => (typeof selector === 'function' ? selector(model) : (model.find(selector) as unknown as Selected));
