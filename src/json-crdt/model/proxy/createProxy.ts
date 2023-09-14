import type {Model} from '../Model';
import type {ToProxyComplexNode} from './types';

export const createProxy = <V>(model: Model<V>): ToProxyComplexNode<V> => {
  const path: string[] = [];
  const factory: any = {};
  factory.create = () => new Proxy({}, {
    get: (target, prop, receiver) => {
      if (prop === 'toNode') return () => model.api.wrap(model.api.find(path) as any);
      if (prop === 'toView') return () => model.api.find(path).view();
      path.push(String(prop));
      return factory.create();
    },
  });
  return factory.create() as ToProxyComplexNode<V>;
};
