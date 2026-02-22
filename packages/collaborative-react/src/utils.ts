import type {NodeApi} from 'json-joy/lib/json-crdt/model/api/nodes';
import type {ApiPath} from 'json-joy/lib/json-crdt/model/api/types';

export type ModelSelector<Top extends NodeApi<any> = NodeApi<any>, Selected extends NodeApi<any> = NodeApi<any>> =
  | ApiPath
  | ((model: Top) => Selected);

export const selectNode = <Top extends NodeApi<any> = NodeApi<any>, Selected extends NodeApi<any> = NodeApi<any>>(
  model: Top,
  selector: ModelSelector<Top, Selected>,
): Selected => (typeof selector === 'function' ? selector(model) : (model.find(selector) as unknown as Selected));
