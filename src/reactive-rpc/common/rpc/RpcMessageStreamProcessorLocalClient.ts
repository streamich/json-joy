import * as msg from '../messages';
import {StreamingRpcClient} from './client/StreamingRpcClient';
import {RpcMessageStreamProcessor} from './RpcMessageStreamProcessor';

export interface RpcMessageStreamProcessorLocalClientParams<Ctx = unknown> {
  ctx: Ctx;
  server: RpcMessageStreamProcessor<Ctx>;
}

/**
 * Implementation or Reactive-RPC client that locally wraps around the server
 * and provides imperative `.call()` and `.call$()` methods, which can be used
 * for testing.
 */
export class RpcMessageStreamProcessorLocalClient<Ctx = unknown> extends StreamingRpcClient {
  constructor(protected readonly params: RpcMessageStreamProcessorLocalClientParams<Ctx>) {
    super({
      send: (messages: msg.ReactiveRpcClientMessage[]) => {
        Promise.resolve().then(() => {
          this.params.server.onMessages(messages, this.params.ctx);
        });
      },
      bufferSize: 1,
      bufferTime: 0,
    });

    this.params.server.onSend = (messages: unknown) => {
      Promise.resolve().then(() => {
        this.onMessages(messages as msg.ReactiveRpcServerMessage[]);
      });
    };
  }
}
