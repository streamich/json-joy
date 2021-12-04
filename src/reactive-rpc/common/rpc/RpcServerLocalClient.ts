import {ReactiveRpcRequestMessage, ReactiveRpcResponseMessage} from '../messages';
import {RpcClient} from './RpcClient';
import {RpcServer} from './RpcServer';

export interface RpcServerLocalClientParams<Ctx = unknown> {
  ctx: Ctx;
  server: RpcServer<Ctx>;
}

/**
 * Implementation or Reactive-RPC client that locally wraps around the server
 * and provides imperative `.call()` and `.call$()` methods, which can be used
 * for testing.
 */
export class RpcServerLocalClient<Ctx = unknown, T = unknown> extends RpcClient<T> {
  constructor(protected readonly params: RpcServerLocalClientParams<Ctx>) {
    super({
      send: (messages: ReactiveRpcRequestMessage<T>[]) => {
        Promise.resolve().then(() => {
          this.params.server.onMessages(messages, this.params.ctx);
        });
      },
      bufferSize: 1,
      bufferTime: 0,
    });

    this.params.server.onSend = (messages: unknown) => {
      Promise.resolve().then(() => {
        this.onMessages(messages as ReactiveRpcResponseMessage<T>[]);
      });
    };
  }
}
