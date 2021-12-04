import {RpcServer, RpcServerResponseType} from '../RpcServer';
import {
  RequestCompleteMessage,
  RequestDataMessage,
  ResponseCompleteMessage,
  ResponseDataMessage,
  ResponseErrorMessage,
} from '../../messages/nominal';
import {RpcApiCaller} from '../RpcApiCaller';
import {until} from '../../../../__tests__/util';
import {encode} from '../../../../json-pack/util';
import {JSON} from '../../../../json-brand';
import {map, Observable} from 'rxjs';

const setupStatic = (methodName: 'call' | 'callJson' | 'callMsgPack' = 'call', doThrow: boolean = false) => {
  const caller = new RpcApiCaller({
    api: {
      concatEcho: {
        isStreaming: false,
        [methodName]: async (ctx: unknown, value: string) => {
          if (doThrow) throw value + value;
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
    bufferSize: 10,
    bufferTime: 10,
  });
  return {caller, onNotification, send, server};
};

const setupStreaming = (methodName: 'call' | 'callJson' | 'callMsgPack' = 'call', doThrow: boolean = false) => {
  const caller = new RpcApiCaller({
    api: {
      concatEcho: {
        isStreaming: true,
        [methodName + '$']: (ctx: unknown, value$: Observable<string>) => {
          if (doThrow) return value$.pipe(map(v => {
            throw v + v;
          }));
          if (methodName === 'call') return value$.pipe(map(value => value + value));
          else if (methodName === 'callJson') return value$.pipe(map(value => JSON.stringify(value + value)));
          else return value$.pipe(map(value => encode(value + value)));
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

const runTests = (setup: typeof setupStatic) => {
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
        expect(messageOut.id).toBe(1);
        expect(messageOut.data).toBe('hellohello');
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
        expect(messageOut.id).toBe(1);
        expect(messageOut.data).toBe(payloadResponse);
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
        expect(messageOut.id).toBe(1);
        expect(messageOut.data).toStrictEqual(payloadResponse);
      });
    });
  });

  describe('returns error payload in specified call type', () => {
    describe('POJO', () => {
      test('static call', async () => {
        const {send, server} = setup('call', true);
        const message = new RequestCompleteMessage(1, 'concatEcho', 'hello');
        server.onMessage(message, {});
        await until(() => send.mock.calls.length === 1);
        const messageOut = send.mock.calls[0][0][0];
        const payload = {message: 'hellohello'};
        expect(messageOut).toStrictEqual(new ResponseErrorMessage(1, payload));
      });

      test('streaming call', async () => {
        const {send, server} = setup('call', true);
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
        const {send, server} = setup('callJson', true);
        const message = new RequestCompleteMessage(1, 'concatEcho', 'hello');
        server.onMessage(message, {});
        await until(() => send.mock.calls.length === 1);
        const messageOut = send.mock.calls[0][0][0];
        const payload = JSON.stringify({message: 'hellohello'});
        expect(messageOut).toStrictEqual(new ResponseErrorMessage(1, payload));
      });

      test('streaming call', async () => {
        const {send, server} = setup('callJson', true);
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
        const {send, server} = setup('callMsgPack', true);
        const message = new RequestCompleteMessage(1, 'concatEcho', 'hello');
        server.onMessage(message, {});
        await until(() => send.mock.calls.length === 1);
        const messageOut = send.mock.calls[0][0][0];
        const payload = encode({message: 'hellohello'});
        expect(messageOut).toStrictEqual(new ResponseErrorMessage(1, payload));
      });

      test('streaming call', async () => {
        const {send, server} = setup('callMsgPack', true);
        const message = new RequestDataMessage(1, 'concatEcho', 'hello');
        server.onMessage(message, {});
        await until(() => send.mock.calls.length === 1);
        const messageOut = send.mock.calls[0][0][0];
        const payload = encode({message: 'hellohello'});
        expect(messageOut).toStrictEqual(new ResponseErrorMessage(1, payload));
      });
    });
  });
};

// describe('static method', () => {
//   runTests(setupStatic);
// });

describe('streaming method', () => {
  runTests(setupStreaming as any);
});
