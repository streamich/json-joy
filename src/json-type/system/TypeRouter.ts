import * as classes from '../type/classes';
import {TypeSystem} from './TypeSystem';
import type {TypeBuilder} from '../type/TypeBuilder';

export interface TypeRouterOptions<R extends RoutesBase> {
  system: TypeSystem;
  routes: R;
}

export class TypeRouter<Routes extends RoutesBase> {
  public static create = <NewRoutes extends RoutesBase>(
    routes?: (t: TypeRouter<{}>) => NewRoutes,
  ): TypeRouter<NewRoutes> => {
    const system = new TypeSystem();
    const router = new TypeRouter({
      system,
      routes: {},
    });
    return routes ? router.extend(routes) : (router as any);
  };

  public system: TypeSystem;
  public t: TypeBuilder;
  public routes: Routes;

  constructor(options: TypeRouterOptions<Routes>) {
    this.system = options.system;
    this.t = this.system.t;
    this.routes = options.routes;
    this.system.importTypes(this.routes);
  }

  protected merge<Router extends TypeRouter<any>>(router: Router): TypeRouter<Routes & TypeRouterRoutes<Router>> {
    return new TypeRouter({
      system: this.system,
      routes: {
        ...this.routes,
        ...router.routes,
      },
    });
  }

  public extend<NewRoutes extends RoutesBase>(routes: (t: this) => NewRoutes): TypeRouter<Routes & NewRoutes> {
    const router = new TypeRouter({system: this.system, routes: routes(this)});
    return this.merge(router);
  }

  public fn<K extends string, R extends classes.FunctionType<any, any>>(
    name: K,
    type: R,
  ): TypeRouter<Routes & {[KK in K]: R}> {
    this.routes[name] = <any>type;
    return <any>this;
  }

  public fn$<K extends string, R extends classes.FunctionStreamingType<any, any>>(
    name: K,
    type: R,
  ): TypeRouter<Routes & {[KK in K]: R}> {
    this.routes[name] = <any>type;
    return <any>this;
  }
}

export type RoutesBase = Record<string, classes.FunctionType<any, any> | classes.FunctionStreamingType<any, any>>;
type TypeRouterRoutes<R extends TypeRouter<any>> = R extends TypeRouter<infer R2> ? R2 : never;
