import {firstValueFrom, from} from 'rxjs';
import {IRpcMethodBase, IStaticRpcMethod} from './types';
import {ConstSchema} from '../../../../json-type';

export interface StaticRpcMethodOptions<Ctx = unknown, Req = unknown, Res = unknown>
  extends Omit<IRpcMethodBase<Ctx, Req, Res>, 'isStreaming' | 'call$'> {}

export class StaticRpcMethod<Ctx = unknown, Req = unknown, Res = unknown> implements IStaticRpcMethod<Ctx, Req, Res> {
  public readonly isStreaming = false;
  public readonly pretty: boolean;
  public readonly validate?: IStaticRpcMethod<Ctx, Req, Res>['validate'];
  public readonly onPreCall?: (ctx: Ctx, request: Req) => Promise<void>;
  public readonly req?: IStaticRpcMethod<Ctx, Req, Res>['req'];
  public readonly res?: IStaticRpcMethod<Ctx, Req, Res>['res'];
  public readonly call: IRpcMethodBase<Ctx, Req, Res>['call'];
  public readonly call$: IRpcMethodBase<Ctx, Req, Res>['call$'];
  public readonly acceptsNotifications: boolean;

  constructor(options: StaticRpcMethodOptions<Ctx, Req, Res>) {
    const {call, validate, onPreCall, pretty, req, res} = options;
    this.pretty = !!pretty;
    this.validate = validate;
    this.onPreCall = onPreCall;
    this.req = req;
    this.res = res;
    const responseIsVoid =
      !!res && res.getTypeName() === 'const' && (res.getSchema() as ConstSchema).value === undefined;
    this.acceptsNotifications = responseIsVoid;
    this.call = call;
    this.call$ = (request$, ctx) => from((async () => this.call(await firstValueFrom(request$), ctx))());
  }
}
