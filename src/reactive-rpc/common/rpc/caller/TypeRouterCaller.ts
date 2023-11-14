import {RpcError, RpcErrorCodes} from './error';
import {RpcCaller, type RpcApiCallerOptions} from './RpcCaller';
import {type AbstractType, FunctionStreamingType, FunctionType} from '../../../../json-type/type/classes';
import {StaticRpcMethod, type StaticRpcMethodOptions} from '../methods/StaticRpcMethod';
import {StreamingRpcMethod, type StreamingRpcMethodOptions} from '../methods/StreamingRpcMethod';
import type {Schema, SchemaOf, TypeOf, TypeSystem} from '../../../../json-type';
import type {TypeRouter} from '../../../../json-type/system/TypeRouter';
import type {Value} from '../../messages/Value';
import type {Observable} from 'rxjs';

export interface TypedApiCallerOptions<Router extends TypeRouter<any>, Ctx = unknown>
  extends Omit<RpcApiCallerOptions<Ctx>, 'getMethod'> {
  router: Router;
}

export class TypeRouterCaller<Router extends TypeRouter<any>, Ctx = unknown> extends RpcCaller<Ctx> {
  protected readonly router: Router;
  protected readonly system: TypeSystem;
  protected readonly methods = new Map<string, StaticRpcMethod<Ctx> | StreamingRpcMethod<Ctx>>();

  constructor({router, ...rest}: TypedApiCallerOptions<Router, Ctx>) {
    super({
      ...rest,
      getMethod: (name) => this.get(name) as any as StaticRpcMethod<Ctx> | StreamingRpcMethod<Ctx>,
    });
    this.router = router;
    this.system = router.system;
  }

  public readonly req: {[K in keyof Routes<Router>]: MethodReq<Routes<Router>[K]>} = null as any;
  public readonly res: {[K in keyof Routes<Router>]: MethodRes<Routes<Router>[K]>} = null as any;

  public get<K extends keyof Routes<Router>>(id: K): MethodDefinition<Ctx, Routes<Router>[K]> {
    let method = this.methods.get(id as string) as any;
    if (method) return method;
    const fn = this.router.routes[id as string];
    // TODO: do this check without relying on constructor and importing the `FunctionType` class.
    if (!fn || !(fn instanceof FunctionType || fn instanceof FunctionStreamingType))
      throw RpcError.valueFromCode(RpcErrorCodes.METHOD_NOT_FOUND, `Type [alias = ${id as string}] is not a function.`);
    const validator = fn.req.validator('object');
    const requestSchema = (fn.req as AbstractType<Schema>).getSchema();
    const isRequestVoid = requestSchema.__t === 'const' && requestSchema.value === undefined;
    const validate = isRequestVoid
      ? () => {}
      : (req: unknown) => {
          const error = validator(req);
          if (error) {
            throw RpcError.value(RpcError.validation(error.message, error));
          }
        };
    method =
      fn instanceof FunctionType
        ? new StaticRpcMethod({
            req: fn.req,
            res: fn.res,
            validate,
            call: fn.singleton as any,
          })
        : new StreamingRpcMethod({
            req: fn.req,
            res: fn.res,
            validate,
            call$: fn.singleton as any,
          });
    this.methods.set(id as string, method as any);
    return method;
  }

  public async call<K extends keyof Routes<Router>>(
    id: K,
    request: MethodReq<Routes<Router>[K]>,
    ctx: Ctx,
  ): Promise<Value<MethodRes<Routes<Router>[K]>>> {
    return super.call(id as string, request, ctx) as any;
  }

  public call$<K extends keyof Routes<Router>>(
    id: K,
    request: Observable<MethodReq<Routes<Router>[K]>>,
    ctx: Ctx,
  ): Observable<Value<MethodRes<Routes<Router>[K]>>> {
    return super.call$(id as string, request, ctx) as any;
  }
}

type Routes<Router> = Router extends TypeRouter<infer R> ? R : never;

type MethodReq<F> = F extends FunctionType<infer Req, any>
  ? TypeOf<SchemaOf<Req>>
  : F extends FunctionStreamingType<infer Req, any>
  ? TypeOf<SchemaOf<Req>>
  : never;

type MethodRes<F> = F extends FunctionType<any, infer Res>
  ? TypeOf<SchemaOf<Res>>
  : F extends FunctionStreamingType<any, infer Res>
  ? TypeOf<SchemaOf<Res>>
  : never;

type MethodDefinition<Ctx, F> = F extends FunctionType<any, any>
  ? StaticRpcMethodOptions<Ctx, MethodReq<F>, MethodRes<F>>
  : F extends FunctionStreamingType<any, any>
  ? StreamingRpcMethodOptions<Ctx, MethodReq<F>, MethodRes<F>>
  : never;
