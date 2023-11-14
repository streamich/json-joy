import {TypeSystem} from '../../json-type';
import {TypeRouter} from '../../json-type/system/TypeRouter';
import {TypeRouterCaller} from '../../reactive-rpc/common/rpc/caller/TypeRouterCaller';
import {Services} from '../services/Services';
import {routes} from './routes';
import type {MyCtx} from '../services/types';
import type {RouteDeps} from './types';

export const createRouter = () => {
  const system = new TypeSystem();
  const r = new TypeRouter({system, routes: {}});
  const deps: RouteDeps = {
    services: new Services(),
  };
  return routes(deps)(r);
};

export const createCaller = () => {
  const router = createRouter();
  const caller = new TypeRouterCaller<typeof router, MyCtx>({router});
  return caller;
};
