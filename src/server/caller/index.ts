import {TypeSystem} from '../../json-type';
import {TypeRouter} from '../../json-type/system/TypeRouter';
import {TypeRouterCaller} from '../../reactive-rpc/common/rpc/caller/TypeRouterCaller';
import {routes} from './routes';

export const createCaller = () => {
  const system = new TypeSystem();
  const router = routes(new TypeRouter({system, routes: {}}));  
  const caller = new TypeRouterCaller({router});
  return caller;
};
