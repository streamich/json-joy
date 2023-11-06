import {createWebSocketMock, MockWebSocket} from '../mock';
import {ChannelState, WebSocketChannel} from '../channel';
import {WebSocketState} from '../constants';

test('creates raw socket and initializes it with listeners', () => {
  let ws: MockWebSocket;
  const newSocket = jest.fn(() => {
    const Socket = createWebSocketMock({});
    ws = new Socket('http://example.com');
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
});

const setup = () => {
  let ws: MockWebSocket;
  const onClose = jest.fn();
  const onSend = jest.fn();
  const newSocket = jest.fn(() => {
    const Socket = createWebSocketMock({
      onClose,
      onSend,
    });
    ws = new Socket('http://example.com');
    return ws;
  });
  const rx = new WebSocketChannel({
    newSocket,
  });

  return {
    ws: ws!,
    rx,
    onClose,
    onSend,
  };
};

test('passes through websocket ready state', () => {
  const {ws, rx} = setup();

  expect(ws.readyState).toBe(WebSocketState.CONNECTING);
  expect(rx.state$.getValue()).toBe(ChannelState.CONNECTING);
  expect(rx.isOpen()).toBe(false);

  ws!._open();

  expect(ws.readyState).toBe(WebSocketState.OPEN);
  expect(rx.state$.getValue()).toBe(ChannelState.OPEN);
  expect(rx.isOpen()).toBe(true);

  ws!._close(0, '', true);

  expect(ws.readyState).toBe(WebSocketState.CLOSED);
  expect(rx.state$.getValue()).toBe(ChannelState.CLOSED);
  expect(rx.isOpen()).toBe(false);
});

test('passes through websocket buffered amount', () => {
  const {ws, rx} = setup();
  expect(rx.buffer()).toBe(0);
  ws._bufferedAmount = 123;
  expect(rx.buffer()).toBe(123);
  ws._open();
  ws.send('test');
  expect(rx.buffer()).toBe(127);
});

test('passes through .close() method', () => {
  const t1 = setup();
  expect(t1.onClose).toHaveBeenCalledTimes(0);
  t1.rx.close();
  expect(t1.onClose).toHaveBeenCalledTimes(1);
  expect(t1.onClose).toHaveBeenCalledWith(undefined, undefined);

  const t2 = setup();
  expect(t2.onClose).toHaveBeenCalledTimes(0);
  t2.rx.close(1, 'reason');
  expect(t2.onClose).toHaveBeenCalledTimes(1);
  expect(t2.onClose).toHaveBeenCalledWith(1, 'reason');
});

test('passes through .send() method', () => {
  const t1 = setup();
  expect(t1.onSend).toHaveBeenCalledTimes(0);
  t1.rx.send('asdf');
  expect(t1.onSend).toHaveBeenCalledTimes(1);
  expect(t1.onSend).toHaveBeenCalledWith('asdf');
});

test('.send() returns buffered amount diff', () => {
  const t1 = setup();
  const buffered = t1.rx.send('asdf');
  expect(buffered).toBe(4);
});

test('.send() returns buffered amount diff', () => {
  const t1 = setup();
  const buffered = t1.rx.send('asdf');
  expect(buffered).toBe(4);
});

describe('.open$', () => {
  test('does not emit at the beginning', async () => {
    const {rx, ws} = setup();
    const open = jest.fn();
    rx.open$.subscribe(open);
    expect(open).toHaveBeenCalledTimes(0);
  });

  test('emits when websocket opens', async () => {
    const {rx, ws} = setup();
    const open = jest.fn();
    rx.open$.subscribe(open);
    ws._open();
    expect(open).toHaveBeenCalledTimes(1);
  });

  test('immediately completes observable when open emits', async () => {
    const {rx, ws} = setup();
    const complete = jest.fn();
    rx.open$.subscribe({complete});
    ws._open();
    expect(complete).toHaveBeenCalledTimes(1);
  });

  test('emits open event when subscription was late', async () => {
    const {rx, ws} = setup();
    const open = jest.fn();
    ws._open();
    rx.open$.subscribe(open);
    expect(open).toHaveBeenCalledTimes(1);
  });

  test('notifies multiple subscribers on open event', async () => {
    const {rx, ws} = setup();
    ws._open();
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
    const {rx} = setup();
    const close = jest.fn();
    rx.close$.subscribe(close);
    expect(close).toHaveBeenCalledTimes(0);
  });

  test('emits when websocket closes', async () => {
    const {rx, ws} = setup();
    const close = jest.fn();
    rx.close$.subscribe(close);
    ws._close(0, 'test', true);
    expect(close).toHaveBeenCalledTimes(1);
  });

  test('immediately completes the observable', async () => {
    const {rx, ws} = setup();
    const next = jest.fn();
    const error = jest.fn();
    const complete = jest.fn();
    rx.close$.subscribe({next, error, complete});
    ws._close(0, 'test', true);
    expect(next).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledTimes(0);
    expect(complete).toHaveBeenCalledTimes(1);
  });

  test('passes through closing information', async () => {
    const {rx, ws} = setup();
    const close = jest.fn();
    rx.close$.subscribe(close);
    ws._close(123, 'test', true);
    expect(close).toHaveBeenCalledTimes(1);
    expect(close).toHaveBeenCalledWith([
      rx,
      {
        code: 123,
        reason: 'test',
        wasClean: true,
      },
    ]);
  });

  test('when constructor fails closes with "CONSTRUCTOR" reason', async () => {
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
        reason: 'CONSTRUCTOR',
        wasClean: true,
      },
    ]);
  });

  test('emits close event when subscription was late', async () => {
    const {rx, ws} = setup();
    const close = jest.fn();
    ws._close(0, 'test', true);
    rx.close$.subscribe(close);
    expect(close).toHaveBeenCalledTimes(1);
  });

  test('notifies multiple subscribers on close event', async () => {
    const {rx, ws} = setup();
    ws._close(0, 'test', true);
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
    const {rx, ws} = setup();
    const error = jest.fn();
    rx.error$.subscribe(error);
    expect(error).toHaveBeenCalledTimes(0);
  });

  test('emits when error happens', async () => {
    const {rx, ws} = setup();
    const error = jest.fn();
    rx.error$.subscribe(error);
    ws._error();
    expect(error).toHaveBeenCalledTimes(1);
  });
});

describe('.message$', () => {
  test('does not emit at the beginning', async () => {
    const {rx, ws} = setup();
    const message = jest.fn();
    rx.message$.subscribe(message);
    expect(message).toHaveBeenCalledTimes(0);
  });

  test('emits when websocket receives a message', async () => {
    const {rx, ws} = setup();
    const message = jest.fn();
    rx.message$.subscribe(message);
    ws._message('test');
    expect(message).toHaveBeenCalledTimes(1);
    expect(message).toHaveBeenCalledWith('test');
    ws._message('test2');
    expect(message).toHaveBeenCalledTimes(2);
    expect(message).toHaveBeenCalledWith('test2');
    const uint8 = new Uint8Array([1, 2, 3]);
    ws._message(uint8);
    expect(message).toHaveBeenCalledTimes(3);
    expect(message).toHaveBeenCalledWith(uint8);
  });
});
