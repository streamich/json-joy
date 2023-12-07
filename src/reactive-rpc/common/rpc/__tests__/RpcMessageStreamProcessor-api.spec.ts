import {Subject} from 'rxjs';
import {RequestCompleteMessage, ResponseCompleteMessage} from '../../messages';
import {ApiRpcCaller} from '../caller/ApiRpcCaller';
import {RpcMessageStreamProcessor, RpcMessageStreamProcessorFromApiOptions} from '../RpcMessageStreamProcessor';
import {sampleApi} from './sample-api';
import {AnyValue} from '../../../../json-type-value/AnyValue';

const setup = (params: Partial<RpcMessageStreamProcessorFromApiOptions> = {}) => {
  const send = jest.fn();
  const subject = new Subject<any>();
  const ctx = {ip: '127.0.0.1'};
  const server = new RpcMessageStreamProcessor<any>({
    send,
    bufferTime: 0,
    caller: new ApiRpcCaller<any, any>({
      api: sampleApi,
    }),
    ...params,
  });
  return {server, send, ctx, subject};
};

test('can create server', async () => {
  setup();
});

test('can execute static RPC method', async () => {
  const {server, send} = setup();
  expect(send).toHaveBeenCalledTimes(0);
  server.onMessage(new RequestCompleteMessage(4, 'ping', new AnyValue({})), {});
  expect(send).toHaveBeenCalledTimes(0);
  await new Promise((r) => setTimeout(r, 1));
  expect(send).toHaveBeenCalledTimes(1);
  expect(send.mock.calls[0][0][0]).toBeInstanceOf(ResponseCompleteMessage);
  const value: Value = send.mock.calls[0][0][0].value;
  expect(value.data).toBe('pong');
});
