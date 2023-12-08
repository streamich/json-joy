import {routes} from './routes';
import {RpcError} from '../../reactive-rpc/common/rpc/caller';
import {RpcValue} from '../../reactive-rpc/common/messages/Value';
import {ObjectValueCaller} from '../../reactive-rpc/common/rpc/caller/ObjectValueCaller';
import {TypeSystem} from '../../json-type';
import {ObjectValue} from '../../json-type-value/ObjectValue';
import type {Services} from '../services/Services';
import type {RouteDeps} from './types';

export const createRouter = (services: Services) => {
  const system = new TypeSystem();
  const router = ObjectValue.create(system);
  const deps: RouteDeps = {
    services,
    router,
    system,
    t: system.t,
  };
  return routes(deps)(router);
};

export const createCaller = (services: Services) => {
  const router = createRouter(services);
  const caller = new ObjectValueCaller<typeof router>({
    router,
    wrapInternalError: (error: unknown) => {
      if (error instanceof RpcValue) return error;
      if (error instanceof RpcError) return RpcError.value(error);
      // tslint:disable-next-line:no-console
      console.error(error);
      return RpcError.valueFrom(error);
    },
  });
  return {router, caller};
};
