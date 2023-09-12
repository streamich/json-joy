import type {Model} from '../Model';
import type {ViewToProxy} from './types';

export const createProxy = <V>(model: Model<V>): ViewToProxy<V> => {
  const path: string[] = [];
  const factory: any = {};
  factory.create = () => new Proxy({}, {
    get: (target, prop, receiver) => {
      if (prop === 'toNode') return () => model.api.find(path);
      if (prop === 'toView') return () => model.api.find(path).view();
      path.push(String(prop));
      return factory.create();
    },
  });
  return factory.create() as ViewToProxy<V>;
};
