import {createContext, useContext} from 'react';
import * as React from 'react';
import type {Model} from 'json-joy/lib/json-crdt';
import type {CrdtNodeApi} from './types';

// -------------------------------------------------------------- Model context

export interface ModelProviderProps<M extends Model<any> = Model<any>> {
  model: M;
  children: React.ReactNode;
}

export interface CtxModelProps<M extends Model<any> = Model<any>> {
  render: (model: M | undefined) => React.ReactNode;
}

// export const createCtx = <M extends Model<any>>(model?: M) => {
//   const ctx = createContext<M | undefined>(model);
//   const ModelCtx: React.FC<ModelProviderProps<M>> = ({children, model}) => {
//     return <ctx.Provider value={model}>{children}</ctx.Provider>;
//   };
//   const useCtxModel = <MM extends Model<any> = M>(): MM | undefined => useContext(ctx) as unknown as MM;
//   const useCtxModelStrict = <MM extends Model<any> = M>(): MM => {
//     const model = useContext(ctx) as unknown as MM;
//     if (!model) throw new Error('NO_MODEL');
//     return model;
//   };
//   const CtxModel: React.FC<CtxModelProps<M>> = ({render}) => render(useCtxModel());
//   return {ctx, ModelCtx, useCtxModel, useCtxModelStrict, CtxModel};
// };

// const {ctx, ModelCtx, useCtxModel, useCtxModelStrict, CtxModel} = createCtx();

// export {
//   ctx,
//   ModelCtx,
//   useCtxModel,
//   useCtxModelStrict,
//   CtxModel,
// };

// --------------------------------------------------------------- Node context

export interface NodeProviderProps<N extends CrdtNodeApi = CrdtNodeApi> {
  node: N;
  children: React.ReactNode;
}

export interface CtxNodeProps<N extends CrdtNodeApi = CrdtNodeApi> {
  render: (node: N | undefined) => React.ReactNode;
}

export const createNodeCtx = <N extends CrdtNodeApi = CrdtNodeApi>(node?: N) => {
  const ctx = createContext<N | undefined>(node);
  const NodeCtx: React.FC<NodeProviderProps<N>> = ({children, node}) => (
    <ctx.Provider value={node}>{children}</ctx.Provider>
  );
  const ModelCtx: React.FC<ModelProviderProps> = ({children, model}) => (
    <NodeCtx node={model.api as unknown as N}>{children}</NodeCtx>
  );
  const useCtxNode = (): N | undefined => useContext(ctx) as unknown as N;
  const useCtxModel = (): Model<any> | undefined => useContext(ctx)?.api.model;
  const useCtxNodeStrict = (): N => {
    const node = useContext(ctx) as unknown as N;
    if (!node) throw new Error('NO_NODE');
    return node;
  };
  const useCtxModelStrict = (): Model<any> => useCtxNodeStrict().api.model;
  const CtxNode: React.FC<CtxNodeProps<N>> = ({render}) => render(useCtxNode());
  const CtxModel: React.FC<CtxModelProps> = ({render}) => render(useCtxModel());
  return {
    ctx,
    NodeCtx,
    ModelCtx,
    useCtxNode,
    useCtxModel,
    useCtxNodeStrict,
    useCtxModelStrict,
    CtxNode,
    CtxModel,
  };
};

const {ctx, NodeCtx, ModelCtx, useCtxNode, useCtxModel, useCtxNodeStrict, useCtxModelStrict, CtxNode, CtxModel} =
  createNodeCtx();

export {ctx, NodeCtx, ModelCtx, useCtxNode, useCtxModel, useCtxNodeStrict, useCtxModelStrict, CtxNode, CtxModel};
