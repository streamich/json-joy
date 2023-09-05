import * as classes from "../type/classes";
import type {TypeSystem} from "./TypeSystem";
import type {TypeBuilder} from "../type/TypeBuilder";

export interface TypeRouterOptions<R extends RoutesBase> {
  system: TypeSystem;
  routes: R;
}

export class TypeRouter<Routes extends RoutesBase> {
  public system: TypeSystem;
  public t: TypeBuilder;
  public routes: Routes;

  constructor(options: TypeRouterOptions<Routes>) {
    this.system = options.system;
    this.t = this.system.t;
    this.routes = options.routes;
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
}

type RoutesBase = Record<string, classes.FunctionType<any, any>>;
type TypeRouterRoutes<R extends TypeRouter<any>> = R extends TypeRouter<infer R2> ? R2 : never;
