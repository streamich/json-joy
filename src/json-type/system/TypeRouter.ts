import {Type} from "../type";
import {TypeSystem} from "./TypeSystem";
import * as classes from "../type/classes";
import {ResolveType} from "./types";

export interface TypeRouterOptions<R extends Record<string, classes.FunctionType<any, any>>> {
  system: TypeSystem;
  routes: R;
}

export class TypeRouter<R extends Record<string, classes.FunctionType<any, any>>> {
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
).implement(async ({value}) => {
  return {
    doc: {},
  };
});

const router = new TypeRouter({
  system,
  routes: {
    'crdtCreate': fn,
  },
});