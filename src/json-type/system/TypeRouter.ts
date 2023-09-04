import {TypeSystem} from "./TypeSystem";
import * as classes from "../type/classes";
import type {TypeBuilder} from "../type/TypeBuilder";

export interface TypeRouterOptions<R extends Record<string, classes.FunctionType<any, any>>> {
  system: TypeSystem;
  routes: R;
}

export class TypeRouter<R extends Record<string, classes.FunctionType<any, any>>> {
  public system: TypeSystem;
  public t: TypeBuilder;
  public routes: R;

  constructor(options: TypeRouterOptions<R>) {
    this.system = options.system;
    this.t = this.system.t;
    this.routes = options.routes;
  }
}
