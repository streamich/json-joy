import {RpcError, RpcErrorCodes} from './error';
import {RpcCaller, RpcApiCallerOptions} from './RpcCaller';
import {FunctionStreamingType, FunctionType} from '../../../../json-type/type/classes';
import {StaticRpcMethod, type StaticRpcMethodOptions} from '../methods/StaticRpcMethod';
import {StreamingRpcMethod, type StreamingRpcMethodOptions} from '../methods/StreamingRpcMethod';
import type {SchemaOf, TypeMap, TypeOf, TypeSystem} from '../../../../json-type';

export interface TypedApiCallerOptions<Ctx = unknown> extends Omit<RpcApiCallerOptions<Ctx>, 'getMethod'> {
  system: TypeSystem;
}

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

export class TypedApiCaller<Types extends TypeMap, Ctx = unknown> extends RpcCaller<Ctx> {
  protected readonly system: TypeSystem;
  protected readonly methods = new Map<string, StaticRpcMethod<Ctx> | StreamingRpcMethod<Ctx>>();

  constructor({system, ...rest}: TypedApiCallerOptions<Ctx>) {
    super({
      ...rest,
      getMethod: (name) => this.get(name) as any as StaticRpcMethod<Ctx> | StreamingRpcMethod<Ctx>,
    });
    this.system = system;
  }

  public readonly req: {[K in keyof Types]: MethodReq<Types[K]>} = null as any;
  public readonly res: {[K in keyof Types]: MethodRes<Types[K]>} = null as any;

  public implement<K extends keyof Types>(id: K, definition_: MethodDefinition<Ctx, Types[K]>): void {
    const definition = definition_ as any;
    if (this.methods.has(id as string)) throw new Error(`Method [id = ${id as string}] is already implemented.`);
    const alias = this.system.resolve(id as string);
    const type = alias.type as FunctionType<any, any> | FunctionStreamingType<any, any>;
    if (!(type instanceof FunctionType || type instanceof FunctionStreamingType))
      throw new Error(`Type [alias = ${alias.id}] is not a function.`);
    const validator = type.validator('boolean');
    const customValidator = definition.validate;
    const validate = customValidator
      ? (req: unknown) => {
          const error = validator(req);
          if (error) throw RpcError.valueFromCode(RpcErrorCodes.BAD_REQUEST);
          customValidator(req);
        }
      : (req: unknown) => {
          const error = validator(req);
          if (error) throw RpcError.valueFromCode(RpcErrorCodes.BAD_REQUEST);
        };
    const isStaticMethodAlias = alias.type instanceof FunctionType;
    const isStreamingMethodAlias = alias.type instanceof FunctionStreamingType;
    const method = isStaticMethodAlias
      ? new StaticRpcMethod({
          ...(definition as StaticRpcMethodOptions<Ctx>),
          req: type.req,
          res: type.res,
          validate,
        })
      : isStreamingMethodAlias
      ? new StreamingRpcMethod({
          ...(definition as StreamingRpcMethodOptions<Ctx>),
          req: type.req,
          res: type.res,
          validate,
        })
      : null;
    if (!method) throw new Error(`Type [alias = ${alias.id}] is not a function.`);
    this.methods.set(id as string, method as any);
  }

  public get<K extends keyof Types>(id: K): MethodDefinition<Ctx, Types[K]> {
    const method = this.methods.get(id as string) as any;
    if (!method) throw RpcError.valueFromCode(RpcErrorCodes.METHOD_NOT_FOUND);
    return method;
  }
}
