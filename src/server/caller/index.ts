import {TypeSystem} from '../../json-type';
import {TypeRouter} from '../../json-type/system/TypeRouter';
import {TypeRouterCaller} from '../../reactive-rpc/common/rpc/caller/TypeRouterCaller';
import {MyCtx} from '../context/types';
import {routes} from './routes';

export const createRouter = () => {
  const system = new TypeSystem();
  const r = new TypeRouter({system, routes: {}});
  const router = routes(r);
  return router;
};

export const createCaller = () => {
  const router = createRouter();
  const caller = new TypeRouterCaller<typeof router, MyCtx>({router});
  return caller;
};
