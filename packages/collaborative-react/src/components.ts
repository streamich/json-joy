import {useModel, useNode} from './hooks';
import type {Model} from 'json-joy/lib/json-crdt';
import type {CrdtNodeApi} from './types';

export interface UseModelProps<M extends Model<any>> {
  model?: M;
  render: (model: M) => React.ReactNode;
}

export const UseModel = <M extends Model<any>>({model, render}: UseModelProps<M>) =>
  render(useModel(m => m, model));

export interface UseNodeProps {
  node?: CrdtNodeApi;
  event?: 'self' | 'child' | 'subtree';
  render: (node: CrdtNodeApi) => React.ReactNode;
}

export const UseNode: React.FC<UseNodeProps> = ({node, event, render}) =>
  render(useNode(node, event));
