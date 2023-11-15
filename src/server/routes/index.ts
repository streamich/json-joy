import {TypeSystem} from '../../json-type';
import {TypeRouter} from '../../json-type/system/TypeRouter';
import {TypeRouterCaller} from '../../reactive-rpc/common/rpc/caller/TypeRouterCaller';
import {routes} from './routes';
import type {Services} from '../services/Services';
import type {RouteDeps} from './types';

export const createRouter = (services: Services) => {
  const system = new TypeSystem();
  const r = new TypeRouter({system, routes: {}});
  const deps: RouteDeps = {services};
  return routes(deps)(r);
};

export const createCaller = (services: Services) => {
  const router = createRouter(services);
  const caller = new TypeRouterCaller<typeof router>({router});
  return caller;
};
