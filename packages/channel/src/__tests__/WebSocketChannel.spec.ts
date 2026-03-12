import {CloseEvent, WebSocketMock} from './WebSocketMock';
import {ChannelState, WebSocketState} from '../constants';
import {WebSocketChannel} from '../WebSocketChannel';
import {WebSocketMockServerConnection} from './WebSocketMockServerConnection';

test('creates raw socket and initializes it with listeners', () => {
  let ws: WebSocketMock;
  const newSocket = jest.fn(() => {
    ws = new WebSocketMock({}, 'http://example.com');
    return ws;
  });

  expect(newSocket).toHaveBeenCalledTimes(0);

  const rx = new WebSocketChannel({
    newSocket,
  });

  expect(newSocket).toHaveBeenCalledTimes(1);
  expect(ws!.onclose).not.toBe(null);
  expect(ws!.onerror).not.toBe(null);
  expect(ws!.onmessage).not.toBe(null);
  expect(ws!.onopen).not.toBe(null);

  rx.close();
});

const setup = () => {
  const connection = new WebSocketMockServerConnection();
  const ws = new WebSocketMock({connection}, 'http://example.com');
  const channel = new WebSocketChannel({
    newSocket: () => ws,
  });
  return {
    connection,
    ws,
    channel,
  };
};

test('passes through websocket ready state', () => {
  const {ws, channel} = setup();
  expect(ws.readyState).toBe(WebSocketState.CONNECTING);
  expect(channel.state$.getValue()).toBe(ChannelState.CONNECTING);
  expect(channel.isOpen()).toBe(false);
  ws.controller.open();
  expect(ws.readyState).toBe(WebSocketState.OPEN);
  expect(channel.state$.getValue()).toBe(ChannelState.OPEN);
  expect(channel.isOpen()).toBe(true);
  ws.controller.close(0, '', true);
  expect(ws.readyState).toBe(WebSocketState.CLOSED);
  expect(channel.state$.getValue()).toBe(ChannelState.CLOSED);
  expect(channel.isOpen()).toBe(false);
});

test('passes through websocket buffered amount', () => {
  const {ws, channel: rx} = setup();
  expect(rx.buffer()).toBe(0);
  ws._bufferedAmount = 123;
  expect(rx.buffer()).toBe(123);
  ws.controller.open();
  ws.send('test');
  expect(rx.buffer()).toBe(127);
});

test('passes through "close" event', () => {
  const t1 = setup();
  const onclose = jest.fn();
  t1.ws.onclose = onclose as any;
  expect(onclose).toHaveBeenCalledTimes(0);
  t1.channel.close(123, 'msg');
  expect(onclose).toHaveBeenCalledTimes(1);
  expect(onclose).toHaveBeenCalledWith(new CloseEvent(123, 'msg', true));
});

test('passes through "error" event', () => {
  const t1 = setup();
  const onerror = jest.fn();
  t1.channel.error$.subscribe(err => onerror(err));
  expect(onerror).toHaveBeenCalledTimes(0);
  t1.ws.controller.error('msg');
  expect(onerror).toHaveBeenCalledTimes(1);
  expect(onerror).toHaveBeenCalledWith(new Error('ERROR'));
});

test('.send() returns buffered amount diff', () => {
  const t1 = setup();
  const buffered = t1.channel.send('asdf');
  expect(buffered).toBe(4);
});

test('.send() returns buffered amount diff', () => {
  const t1 = setup();
  const buffered = t1.channel.send('asdf');
  expect(buffered).toBe(4);
});

describe('.open$', () => {
  test('does not emit at the beginning', async () => {
    const {channel: rx} = setup();
    const open = jest.fn();
    rx.open$.subscribe(open);
    expect(open).toHaveBeenCalledTimes(0);
  });

  test('emits when websocket opens', async () => {
    const {channel: rx, ws} = setup();
    const open = jest.fn();
    rx.open$.subscribe(open);
    ws.controller.open();
    expect(open).toHaveBeenCalledTimes(1);
  });

  test('immediately completes observable when open emits', async () => {
    const {channel: rx, ws} = setup();
    const complete = jest.fn();
    rx.open$.subscribe({complete});
    ws.controller.open();
    expect(complete).toHaveBeenCalledTimes(1);
  });

  test('emits open event when subscription was late', async () => {
    const {channel: rx, ws} = setup();
    const open = jest.fn();
    ws.controller.open();
    rx.open$.subscribe(open);
    expect(open).toHaveBeenCalledTimes(1);
  });

  test('notifies multiple subscribers on open event', async () => {
    const {channel: rx, ws} = setup();
    ws.controller.open();
    const open1 = jest.fn();
    const open2 = jest.fn();
    rx.open$.subscribe(open1);
    rx.open$.subscribe(open2);
    expect(open1).toHaveBeenCalledTimes(1);
    expect(open2).toHaveBeenCalledTimes(1);
  });
});

describe('.close$', () => {
  test('does not emit at the beginning', async () => {
    const {channel: rx} = setup();
    const close = jest.fn();
    rx.close$.subscribe(close);
    expect(close).toHaveBeenCalledTimes(0);
  });

  test('emits when websocket closes', async () => {
    const {channel: rx, ws} = setup();
    const close = jest.fn();
    rx.close$.subscribe(close);
    ws.controller.close(0, 'test', true);
    expect(close).toHaveBeenCalledTimes(1);
  });

  test('immediately completes the observable', async () => {
    const {channel: rx, ws} = setup();
    const next = jest.fn();
    const error = jest.fn();
    const complete = jest.fn();
    rx.close$.subscribe({next, error, complete});
    ws.controller.close(0, 'test', true);
    expect(next).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledTimes(0);
    expect(complete).toHaveBeenCalledTimes(1);
  });

  test('passes through closing information', async () => {
    const {channel: rx, ws} = setup();
    const close = jest.fn();
    rx.close$.subscribe(close);
    ws.controller.close(123, 'test', true);
    expect(close).toHaveBeenCalledTimes(1);
    expect(close).toHaveBeenCalledWith([
      rx,
      new CloseEvent(123, 'test', true),
    ]);
  });

  test('when constructor fails closes with "INIT" reason', async () => {
    const newSocket = jest.fn(() => {
      throw new Error('lala');
    });
    const rx = new WebSocketChannel({
      newSocket,
    });
    const close = jest.fn();
    rx.close$.subscribe(close);
    expect(close).toHaveBeenCalledTimes(1);
    expect(close).toHaveBeenCalledWith([
      rx,
      {
        code: 0,
        reason: 'INIT',
        wasClean: true,
      },
    ]);
  });

  test('emits close event when subscription was late', async () => {
    const {channel: rx, ws} = setup();
    const close = jest.fn();
    ws.controller.close(0, 'test', true);
    rx.close$.subscribe(close);
    expect(close).toHaveBeenCalledTimes(1);
  });

  test('notifies multiple subscribers on close event', async () => {
    const {channel: rx, ws} = setup();
    ws.controller.close(0, 'test', true);
    const close1 = jest.fn();
    const close2 = jest.fn();
    rx.close$.subscribe(close1);
    rx.close$.subscribe(close2);
    expect(close1).toHaveBeenCalledTimes(1);
    expect(close2).toHaveBeenCalledTimes(1);
  });
});

describe('.error$', () => {
  test('does not emit at the beginning', async () => {
    const {channel: rx} = setup();
    const error = jest.fn();
    rx.error$.subscribe(error);
    expect(error).toHaveBeenCalledTimes(0);
  });

  test('emits when error happens', async () => {
    const {channel: rx, ws} = setup();
    const error = jest.fn();
    rx.error$.subscribe(error);
    ws.controller.error('123');
    expect(error).toHaveBeenCalledTimes(1);
  });
});

describe('.message$', () => {
  test('does not emit at the beginning', async () => {
    const {channel: rx} = setup();
    const message = jest.fn();
    rx.message$.subscribe(message);
    expect(message).toHaveBeenCalledTimes(0);
  });

  test('emits when websocket receives a message', async () => {
    const {channel: rx, ws} = setup();
    const message = jest.fn();
    rx.message$.subscribe(message);
    ws.controller.message('test');
    expect(message).toHaveBeenCalledTimes(1);
    expect(message).toHaveBeenCalledWith('test');
    ws.controller.message('test2');
    expect(message).toHaveBeenCalledTimes(2);
    expect(message).toHaveBeenCalledWith('test2');
    const uint8 = new Uint8Array([1, 2, 3]);
    ws.controller.message(uint8);
    expect(message).toHaveBeenCalledTimes(3);
    expect(message).toHaveBeenCalledWith(uint8);
  });
});
