import {RpcError} from './error';
import {RpcCaller, type RpcApiCallerOptions} from './RpcCaller';
import {type AbstractType, FunctionStreamingType, FunctionType} from '../../../../json-type/type/classes';
import {StaticRpcMethod, type StaticRpcMethodOptions} from '../methods/StaticRpcMethod';
import {StreamingRpcMethod, type StreamingRpcMethodOptions} from '../methods/StreamingRpcMethod';
import {type ObjectType, type Schema, type TypeSystem, ObjectFieldType, TypeOf, SchemaOf, Type} from '../../../../json-type';
import type {ObjectValue, UnObjectType, UnObjectValue} from '../../../../json-type-value/ObjectValue';
import type {Value} from '../../../../json-type-value/Value';
import type {Observable} from 'rxjs';
import type {RpcValue} from '../../messages/Value';

type ObjectFieldToTuple<F> = F extends ObjectFieldType<infer K, infer V> ? [K, V] : never;
type ToObject<T> = T extends [string, unknown][] ? {[K in T[number] as K[0]]: K[1]} : never;
type ObjectFieldsToMap<F> = ToObject<{[K in keyof F]: ObjectFieldToTuple<F[K]>}>;
type ObjectValueToTypeMap<V> = ObjectFieldsToMap<UnObjectType<UnObjectValue<V>>>;

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

export interface ObjectValueCallerOptions<V extends ObjectValue<ObjectType<any>>, Ctx = unknown>
  extends Omit<RpcApiCallerOptions<Ctx>, 'getMethod'> {
  value: V;
}

export class ObjectValueCaller<V extends ObjectValue<ObjectType<any>>, Ctx = unknown> extends RpcCaller<Ctx> {
  protected readonly value: V;
  protected readonly system: TypeSystem;
  protected readonly methods = new Map<string, StaticRpcMethod<Ctx> | StreamingRpcMethod<Ctx>>();

  constructor({value, ...rest}: ObjectValueCallerOptions<V, Ctx>) {
    super({
      ...rest,
      getMethod: (name) => this.get(name) as any as StaticRpcMethod<Ctx> | StreamingRpcMethod<Ctx>,
    });
    this.value = value;
    const system = value.type.system;
    if (!system) throw new Error('NO_SYSTEM');
    this.system = system;
  }

  public get<K extends keyof ObjectValueToTypeMap<V>>(id: K): MethodDefinition<Ctx, ObjectValueToTypeMap<V>[K]> | undefined {
    let method = this.methods.get(id as string) as any;
    if (method) return method;
    const fn = this.value.get(<string>id) as Value<Type>;
    if (!fn || !(fn.type instanceof FunctionType || fn.type instanceof FunctionStreamingType)) {
      // const system = type.getSystem();
      // fn = system.t.Function(t.any, fn);
      throw new Error('NOT_FUNCTION');
    }
    const fnType = fn.type as FunctionType<Type, Type> | FunctionStreamingType<Type, Type>;
    const {req, res} = fnType;
    const call = fn.data;
    const validator = fnType.req.validator('object');
    const requestSchema = (fnType.req as AbstractType<Schema>).getSchema();
    const isRequestVoid = requestSchema.__t === 'const' && requestSchema.value === undefined;
    const validate = isRequestVoid
      ? () => {}
      : (req: unknown) => {
          const error: any = validator(req);
          if (error) {
            const message = error.message + (Array.isArray(error?.path) ? ' Path: /' + error.path.join('/') : '');
            throw RpcError.value(RpcError.validation(message, error));
          }
        };
    method = fnType instanceof FunctionType
        ? new StaticRpcMethod({req, res, validate, call})
        : new StreamingRpcMethod({req, res, validate, call$: call});
    this.methods.set(id as string, method as any);
    return method;
  }

  public async call<K extends keyof ObjectValueToTypeMap<V>>(
    id: K,
    request: MethodReq<ObjectValueToTypeMap<V>[K]>,
    ctx: Ctx,
  ): Promise<RpcValue<MethodRes<ObjectValueToTypeMap<V>[K]>>> {
    return super.call(id as string, request, ctx) as any;
  }

  public async callSimple<K extends keyof ObjectValueToTypeMap<V>>(
    id: K,
    request: MethodReq<ObjectValueToTypeMap<V>[K]>,
    ctx: Ctx = {} as any,
  ): Promise<MethodRes<ObjectValueToTypeMap<V>[K]>> {
    try {
      const res = await this.call(id as string, request, ctx);
      return res.data;
    } catch (err) {
      const error = err as RpcValue<RpcError>;
      throw error.data;
    }
  }

  public call$<K extends keyof ObjectValueToTypeMap<V>>(
    id: K,
    request: Observable<MethodReq<ObjectValueToTypeMap<V>[K]>>,
    ctx: Ctx,
  ): Observable<RpcValue<MethodRes<ObjectValueToTypeMap<V>[K]>>> {
    return super.call$(id as string, request, ctx) as any;
  }
}
