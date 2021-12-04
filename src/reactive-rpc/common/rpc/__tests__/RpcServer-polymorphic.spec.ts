import {RpcServer, RpcServerResponseType} from '../RpcServer';
import {
  RequestCompleteMessage,
  RequestDataMessage,
  ResponseCompleteMessage,
  ResponseErrorMessage,
} from '../../messages/nominal';
import {RpcApiCaller} from '../RpcApiCaller';
import {until} from '../../../../__tests__/util';
import {encode} from '../../../../json-pack/util';
import {JSON} from '../../../../json-brand';

const setup = (methodName: 'call' | 'callJson' | 'callMsgPack' = 'call') => {
  const caller = new RpcApiCaller({
    api: {
      concatEcho: {
        isStreaming: false,
        [methodName]: async (ctx: unknown, value: string) => {
          if (methodName === 'call') return value + value;
          else if (methodName === 'callJson') return JSON.stringify(value + value);
          else return encode(value + value);
        },
      },
    },
  });
  const onNotification = jest.fn();
  const send = jest.fn();
  const callType =
    methodName === 'call'
      ? RpcServerResponseType.POJO
      : methodName === 'callJson'
      ? RpcServerResponseType.JSON
      : RpcServerResponseType.PACK;
  const server = new RpcServer({
    callType,
    caller,
    onNotification,
    send,
  });
  return {caller, onNotification, send, server};
};

describe('static method', () => {
  describe('returns response payload in specified call type', () => {
    describe('POJO', () => {
      test('static call', async () => {
        const {send, server} = setup();
        const message = new RequestCompleteMessage(1, 'concatEcho', 'hello');
        server.onMessage(message, {});
        await until(() => send.mock.calls.length === 1);
        const messageOut = send.mock.calls[0][0][0];
        expect(messageOut).toStrictEqual(new ResponseCompleteMessage(1, 'hellohello'));
      });

      test('streaming call', async () => {
        const {send, server} = setup();
        const message = new RequestDataMessage(1, 'concatEcho', 'hello');
        server.onMessage(message, {});
        await until(() => send.mock.calls.length === 1);
        const messageOut = send.mock.calls[0][0][0];
        expect(messageOut).toStrictEqual(new ResponseCompleteMessage(1, 'hellohello'));
      });
    });

    describe('JSON', () => {
      test('static call', async () => {
        const {send, server} = setup('callJson');
        const message = new RequestCompleteMessage(1, 'concatEcho', 'hello');
        server.onMessage(message, {});
        await until(() => send.mock.calls.length === 1);
        const messageOut = send.mock.calls[0][0][0];
        const payloadResponse = JSON.stringify('hellohello');
        expect(messageOut).toStrictEqual(new ResponseCompleteMessage(1, payloadResponse));
      });

      test('streaming call', async () => {
        const {send, server} = setup('callJson');
        const message = new RequestDataMessage(1, 'concatEcho', 'hello');
        server.onMessage(message, {});
        await until(() => send.mock.calls.length === 1);
        const messageOut = send.mock.calls[0][0][0];
        const payloadResponse = JSON.stringify('hellohello');
        expect(messageOut).toStrictEqual(new ResponseCompleteMessage(1, payloadResponse));
      });
    });

    describe('MessagePack', () => {
      test('static call', async () => {
        const {send, server} = setup('callMsgPack');
        const message = new RequestCompleteMessage(1, 'concatEcho', 'hello');
        server.onMessage(message, {});
        await until(() => send.mock.calls.length === 1);
        const messageOut = send.mock.calls[0][0][0];
        const payloadResponse = encode('hellohello');
        expect(messageOut).toStrictEqual(new ResponseCompleteMessage(1, payloadResponse));
      });

      test('streaming call', async () => {
        const {send, server} = setup('callMsgPack');
        const message = new RequestDataMessage(1, 'concatEcho', 'hello');
        server.onMessage(message, {});
        await until(() => send.mock.calls.length === 1);
        const messageOut = send.mock.calls[0][0][0];
        const payloadResponse = encode('hellohello');
        expect(messageOut).toStrictEqual(new ResponseCompleteMessage(1, payloadResponse));
      });
    });
  });

  describe('returns error payload in specified call type', () => {
    describe('POJO', () => {
      test('static call', async () => {
        const caller = new RpcApiCaller({
          api: {
            concatEcho: {
              isStreaming: false,
              call: async (ctx: unknown, value: string) => {
                throw value + value;
              },
            },
          },
        });
        const onNotification = jest.fn();
        const send = jest.fn();
        const server = new RpcServer({
          callType: RpcServerResponseType.POJO,
          caller,
          onNotification,
          send,
        });
        const message = new RequestCompleteMessage(1, 'concatEcho', 'hello');
        server.onMessage(message, {});
        await until(() => send.mock.calls.length === 1);
        const messageOut = send.mock.calls[0][0][0];
        const payload = {message: 'hellohello'};
        expect(messageOut).toStrictEqual(new ResponseErrorMessage(1, payload));
      });

      test('streaming call', async () => {
        const caller = new RpcApiCaller({
          api: {
            concatEcho: {
              isStreaming: false,
              call: async (ctx: unknown, value: string) => {
                throw value + value;
              },
            },
          },
        });
        const onNotification = jest.fn();
        const send = jest.fn();
        const server = new RpcServer({
          callType: RpcServerResponseType.POJO,
          caller,
          onNotification,
          send,
        });
        const message = new RequestDataMessage(1, 'concatEcho', 'hello');
        server.onMessage(message, {});
        await until(() => send.mock.calls.length === 1);
        const messageOut = send.mock.calls[0][0][0];
        const payload = {message: 'hellohello'};
        expect(messageOut).toStrictEqual(new ResponseErrorMessage(1, payload));
      });
    });

    describe('JSON', () => {
      test('static call', async () => {
        const caller = new RpcApiCaller({
          api: {
            concatEcho: {
              isStreaming: false,
              call: async (ctx: unknown, value: string) => {
                throw value + value;
              },
            },
          },
        });
        const onNotification = jest.fn();
        const send = jest.fn();
        const server = new RpcServer({
          callType: RpcServerResponseType.JSON,
          caller,
          onNotification,
          send,
        });
        const message = new RequestCompleteMessage(1, 'concatEcho', 'hello');
        server.onMessage(message, {});
        await until(() => send.mock.calls.length === 1);
        const messageOut = send.mock.calls[0][0][0];
        const payload = JSON.stringify({message: 'hellohello'});
        expect(messageOut).toStrictEqual(new ResponseErrorMessage(1, payload));
      });

      test('streaming call', async () => {
        const caller = new RpcApiCaller({
          api: {
            concatEcho: {
              isStreaming: false,
              call: async (ctx: unknown, value: string) => {
                throw value + value;
              },
            },
          },
        });
        const onNotification = jest.fn();
        const send = jest.fn();
        const server = new RpcServer({
          callType: RpcServerResponseType.JSON,
          caller,
          onNotification,
          send,
        });
        const message = new RequestDataMessage(1, 'concatEcho', 'hello');
        server.onMessage(message, {});
        await until(() => send.mock.calls.length === 1);
        const messageOut = send.mock.calls[0][0][0];
        const payload = JSON.stringify({message: 'hellohello'});
        expect(messageOut).toStrictEqual(new ResponseErrorMessage(1, payload));
      });
    });

    describe('MessagePack', () => {
      test('static call', async () => {
        const caller = new RpcApiCaller({
          api: {
            concatEcho: {
              isStreaming: false,
              call: async (ctx: unknown, value: string) => {
                throw value + value;
              },
            },
          },
        });
        const onNotification = jest.fn();
        const send = jest.fn();
        const server = new RpcServer({
          callType: RpcServerResponseType.PACK,
          caller,
          onNotification,
          send,
        });
        const message = new RequestCompleteMessage(1, 'concatEcho', 'hello');
        server.onMessage(message, {});
        await until(() => send.mock.calls.length === 1);
        const messageOut = send.mock.calls[0][0][0];
        const payload = encode({message: 'hellohello'});
        expect(messageOut).toStrictEqual(new ResponseErrorMessage(1, payload));
      });

      test('streaming call', async () => {
        const caller = new RpcApiCaller({
          api: {
            concatEcho: {
              isStreaming: false,
              call: async (ctx: unknown, value: string) => {
                throw value + value;
              },
            },
          },
        });
        const onNotification = jest.fn();
        const send = jest.fn();
        const server = new RpcServer({
          callType: RpcServerResponseType.PACK,
          caller,
          onNotification,
          send,
        });
        const message = new RequestDataMessage(1, 'concatEcho', 'hello');
        server.onMessage(message, {});
        await until(() => send.mock.calls.length === 1);
        const messageOut = send.mock.calls[0][0][0];
        const payload = encode({message: 'hellohello'});
        expect(messageOut).toStrictEqual(new ResponseErrorMessage(1, payload));
      });
    });
  });
});
