import {sampleApi} from './api';
import {RpcServer} from '../RpcServer';
import {RpcServerLocalClient} from '../RpcServerLocalClient';
import {of} from '../../util/of';

const setup = () => {
  const server = RpcServer.fromApi<any, any>({
    send: (messages) => {},
    onNotification: () => {},
    api: sampleApi,
    bufferSize: 2,
    bufferTime: 1,
    maxActiveCalls: 3,
  });
  const client = new RpcServerLocalClient({
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
    expect(error1).toEqual({message: 'this promise can throw'});
    const [, error2] = await of(client.call('streamError', {}));
    expect(error2).toEqual({message: 'Stream always errors'});
  });
});
