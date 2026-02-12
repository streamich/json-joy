import {createContext, useContext} from 'react';
import * as React from 'react';
import type {Model} from 'json-joy/lib/json-crdt';

export interface ModelProviderProps<M extends Model<any> = Model<any>> {
  model: M;
  children: React.ReactNode;
}

export interface CtxModelProps<M extends Model<any> = Model<any>> {
  render: (model: M | undefined) => React.ReactNode;
}

export const createCtx = <M extends Model<any>>(model?: M) => {
  const ctx = createContext<M | undefined>(model);
  const ModelCtx: React.FC<ModelProviderProps<M>> = ({children, model}) => {
    return <ctx.Provider value={model}>{children}</ctx.Provider>;
  };
  const useCtxModel = <MM extends Model<any> = M>(): MM | undefined => useContext(ctx) as unknown as MM;
  const useCtxModelStrict = <MM extends Model<any> = M>(): MM => {
    const model = useContext(ctx) as unknown as MM;
    if (!model) throw new Error('NO_MODEL');
    return model;
  };
  const CtxModel: React.FC<CtxModelProps<M>> = ({render}) => render(useCtxModel());
  return {ctx, ModelCtx, useCtxModel, useCtxModelStrict, CtxModel};
};

const {ctx, ModelCtx, useCtxModel, useCtxModelStrict, CtxModel} = createCtx();

export {
  ctx,
  ModelCtx,
  useCtxModel,
  useCtxModelStrict,
  CtxModel,
};
