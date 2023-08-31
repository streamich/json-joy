import {Type} from "../type";
import {TypeSystem} from "./TypeSystem";
import {ResolveType} from "./types";

interface Route<Req extends Type = Type, Res extends Type = Type> {
  req: Req;
  res: Res;
  call: (req: ResolveType<Req>) => Promise<ResolveType<Res>>;
}

export interface TypeRouterOptions<R extends Record<string, Route>> {
  system: TypeSystem;
  routes: R;
}

export class TypeRouter<R extends Record<string, Route>> {
  constructor(options: TypeRouterOptions<R>) {}
}


const system = new TypeSystem();
const t = system.t;
const fn = t.Function(
  t.Object(
    t.prop('value', system.t.any),
  ),
  t.Object(
    t.prop('doc', system.t.any),
  ),
).singleton(async ({value}) => {
  return {
    doc: {},
  };
});

const router = new TypeRouter({
  system,
  routes: {
    'crdtCreate': {
      req: t.Object(
        t.prop('value', system.t.any),
      ),
      res: t.Object(
        t.prop('doc', system.t.any),
      ),
      call: async ({}) => {
        return {
          
        };
      },
    } as const,
  },
});