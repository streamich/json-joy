import {RpcMessageStreamProcessor} from '../RpcMessageStreamProcessor';
import {RpcMessageStreamProcessorLocalClient} from '../RpcMessageStreamProcessorLocalClient';
import {of} from '../../util/of';
import {ApiRpcCaller} from '../caller/ApiRpcCaller';
import {sampleApi} from './sample-api';

const setup = () => {
  const server = new RpcMessageStreamProcessor<any>({
    send: (messages: any) => {},
    caller: new ApiRpcCaller<any, any>({
      api: sampleApi,
    }),
    bufferSize: 2,
    bufferTime: 1,
  });
  const client = new RpcMessageStreamProcessorLocalClient({
    ctx: {},
    server,
  });

  return {
    server,
    client,
  };
};

describe('.call() method', () => {
  test('can execute a simple "ping" call', async () => {
    const {client} = setup();
    const res = await client.call('ping', {});
    expect(res).toBe('pong');
  });

  test('̀can pass arguments', async () => {
    const {client} = setup();
    const res = await client.call('double', {num: 1.2});
    expect(res).toEqual({num: 2.4});
  });

  test('can return back an error', async () => {
    const {client} = setup();
    const [, error1] = await of(client.call('error', {}));
    expect(error1.message).toBe('this promise can throw');
    const [, error2] = await of(client.call('streamError', {}));
    expect(error2.message).toEqual('Stream always errors');
  });
});
