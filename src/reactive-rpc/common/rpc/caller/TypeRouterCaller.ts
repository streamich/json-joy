import {RpcError, RpcErrorCodes} from './error';
import {RpcCaller, type RpcApiCallerOptions} from './RpcCaller';
import {type AbstractType, FunctionStreamingType, FunctionType} from '../../../../json-type/type/classes';
import {StaticRpcMethod, type StaticRpcMethodOptions} from '../methods/StaticRpcMethod';
import {StreamingRpcMethod, type StreamingRpcMethodOptions} from '../methods/StreamingRpcMethod';
import type {Schema, SchemaOf, TypeOf, TypeSystem} from '../../../../json-type';
import type {TypeRouter} from '../../../../json-type/system/TypeRouter';
import type {RpcValue} from '../../messages/Value';
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

  public get<K extends keyof Routes<Router>>(id: K): MethodDefinition<Ctx, Routes<Router>[K]> | undefined {
    let method = this.methods.get(id as string) as any;
    if (method) return method;
    const fn = this.router.routes[id as string];
    if (!fn || !(fn instanceof FunctionType || fn instanceof FunctionStreamingType)) return undefined;
    const validator = fn.req.validator('object');
    const requestSchema = (fn.req as AbstractType<Schema>).getSchema();
    const isRequestVoid = requestSchema.__t === 'const' && requestSchema.value === undefined;
    const validate = isRequestVoid
      ? () => {}
      : (req: unknown) => {
          const error = validator(req);
          if (error) {
            const message = error.message + (Array.isArray(error?.path) ? ' Path: /' + error.path.join('/') : '');
            throw RpcError.value(RpcError.validation(message, error));
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
  ): Promise<RpcValue<MethodRes<Routes<Router>[K]>>> {
    return super.call(id as string, request, ctx) as any;
  }

  public async callSimple<K extends keyof Routes<Router>>(
    id: K,
    request: MethodReq<Routes<Router>[K]>,
    ctx: Ctx = {} as any,
  ): Promise<MethodRes<Routes<Router>[K]>> {
    try {
      const res = await this.call(id as string, request, ctx);
      return res.data;
    } catch (err) {
      const error = err as RpcValue<RpcError>;
      throw error.data;
    }
  }

  public call$<K extends keyof Routes<Router>>(
    id: K,
    request: Observable<MethodReq<Routes<Router>[K]>>,
    ctx: Ctx,
  ): Observable<RpcValue<MethodRes<Routes<Router>[K]>>> {
    return super.call$(id as string, request, ctx) as any;
  }
}

type Routes<Router> = Router extends TypeRouter<infer R> ? R : never;

type MethodReq<F> =
  F extends FunctionType<infer Req, any>
    ? TypeOf<SchemaOf<Req>>
    : F extends FunctionStreamingType<infer Req, any>
      ? TypeOf<SchemaOf<Req>>
      : never;

type MethodRes<F> =
  F extends FunctionType<any, infer Res>
    ? TypeOf<SchemaOf<Res>>
    : F extends FunctionStreamingType<any, infer Res>
      ? TypeOf<SchemaOf<Res>>
      : never;

type MethodDefinition<Ctx, F> =
  F extends FunctionType<any, any>
    ? StaticRpcMethodOptions<Ctx, MethodReq<F>, MethodRes<F>>
    : F extends FunctionStreamingType<any, any>
      ? StreamingRpcMethodOptions<Ctx, MethodReq<F>, MethodRes<F>>
      : never;
