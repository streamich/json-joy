import {firstValueFrom, Observable} from 'rxjs';
import {ReactiveRpcRequestMessage} from "../messages";
import {RpcClient} from "./RpcClient";
import {RpcServer} from "./RpcServer";

export interface RpcServerLocalClientParams<Ctx = unknown, T = unknown> {
  ctx: Ctx;
  server: RpcServer<Ctx, T>;
}

/**
 * Implementation or Reactive-RPC client that locally wraps around the server
 * and provides imperative `.call()` and `.call$()` methods, which can be used
 * for testing.
 */
export class RpcServerLocalClient<Ctx = unknown, T = unknown> extends RpcClient<T> {
  constructor(protected readonly params: RpcServerLocalClientParams<Ctx, T>) {
    super({
      send: (messages: ReactiveRpcRequestMessage<T>[]) => {
        Promise.resolve().then(() => {
          this.params.server.onMessages(messages, this.params.ctx);
        });
      },
      bufferSize: 1,
      bufferTime: 0,
    });

    this.params.server.onsend = messages => {
      Promise.resolve().then(() => {
        this.onMessages(messages);
      });
    };
  }
}
