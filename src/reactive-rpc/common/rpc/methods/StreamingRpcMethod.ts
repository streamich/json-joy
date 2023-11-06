import {firstValueFrom, of} from 'rxjs';
import type {IRpcMethodBase, IStreamingRpcMethod} from './types';

export interface StreamingRpcMethodOptions<Ctx = unknown, Req = unknown, Res = unknown>
  extends Omit<IStreamingRpcMethod<Ctx, Req, Res>, 'isStreaming' | 'call'> {}

export class StreamingRpcMethod<Ctx = unknown, Req = unknown, Res = unknown>
  implements IStreamingRpcMethod<Ctx, Req, Res>
{
  public readonly isStreaming = true;
  public readonly pretty: boolean;
  public readonly validate?: IStreamingRpcMethod<Ctx, Req, Res>['validate'];
  public readonly onPreCall?: (ctx: Ctx, request: Req) => Promise<void>;
  public readonly req?: IStreamingRpcMethod<Ctx, Req, Res>['req'];
  public readonly res?: IStreamingRpcMethod<Ctx, Req, Res>['res'];
  public readonly call: IRpcMethodBase<Ctx, Req, Res>['call'];
  public readonly call$: IRpcMethodBase<Ctx, Req, Res>['call$'];
  public readonly preCallBufferSize?: number;

  constructor(options: StreamingRpcMethodOptions<Ctx, Req, Res>) {
    const {call$, onPreCall, pretty, validate, req, res, preCallBufferSize} = options;
    this.pretty = !!pretty;
    this.validate = validate;
    this.onPreCall = onPreCall;
    this.req = req;
    this.res = res;
    this.preCallBufferSize = preCallBufferSize;
    this.call = (request, ctx) => firstValueFrom(call$(of(request), ctx));
    this.call$ = call$;
  }
}
