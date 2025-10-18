import type {ObjType} from '../../type';
import type {TypeBuilder} from '../../type/TypeBuilder';
import {ObjValue} from '../ObjValue';

interface Services {
  log: (msg: string) => void;
}

export interface RouteDeps {
  svc: Services;
  t: TypeBuilder;
}
export type RouterBase = ObjType<any>;
export type Router<R extends RouterBase> = ObjValue<R>;

const addLogMessageRoute =
  ({t, svc}: RouteDeps) =>
  <R extends RouterBase>(r: Router<R>) => {
    return r.set(
      'log.message',
      t.fn
        .inp(t.Object(t.Key('message', t.str)))
        .out(
          t.object({
            time: t.num,
          }),
        )
        .value(({message}) => {
          svc.log(message);
          return {time: Date.now()};
        }),
    );
  };

export const createRouter = (svc: Services) => {
  const base = ObjValue.new();
  const t = base.system.t;
  const deps: RouteDeps = {svc, t};
  const router = addLogMessageRoute(deps)(base);
  return router;
};
