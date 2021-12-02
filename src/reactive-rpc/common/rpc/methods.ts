import type {RpcMethodTyped, RpcMethodTypedStatic} from ".";
import type {MsgPack} from "../../../json-pack";
import {JSON, json_string} from "../../../json-brand";
import {decoder, encoderFull} from "../../../json-pack/util";

export class RpcMethodStaticPolymorphic<Context = unknown, Request = unknown, Response = unknown> implements RpcMethodTyped<Context, Request> {
  public readonly isStreaming = false;
  public readonly req: string;
  public readonly res: string;
  public readonly validate?: (request: Request) => void;
  public readonly onPreCall?: (ctx: Context, request: Request) => Promise<void>;
  public readonly pretty: boolean;
  public readonly call: (ctx: Context, request: Request) => Promise<Response>;
  public readonly callJson: (ctx: Context, request: Request) => Promise<json_string<Response>>;
  public readonly callMsgPack: (ctx: Context, request: Request) => Promise<MsgPack<Response>>;

  constructor (method: RpcMethodTypedStatic<Context, Request, Response>) {
    this.req = method.req;
    this.res = method.res;
    this.validate = method.validate;
    this.onPreCall = method.onPreCall;
    this.pretty = !!method.pretty;

    const {call, callJson, callMsgPack} = method;

    if (call) this.call = call;
    else if (callJson) {
      this.call = async (ctx, request) => {
        const json = await callJson(ctx, request);
        return JSON.parse(json);
      };
    } else if (callMsgPack) {
      this.call = async (ctx, request) => {
        const blob = await callMsgPack(ctx, request);
        return decoder.decode(blob) as Response;
      };
    } else throw new Error("No call method defined.");

    this.callJson = callJson ? callJson : async (ctx, request) => {
      const result = await this.call(ctx, request);
      return JSON.stringify(result);
    };

    this.callMsgPack = callMsgPack ? callMsgPack : async (ctx, request) => {
      const result = await this.call(ctx, request);
      return encoderFull.encode(result) as MsgPack<Response>;
    };
  }
}
