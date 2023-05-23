import {createWebSocketMock, MockWebSocket} from '../mock';
import {WebSocketChannel, PersistentChannel, Channel, PersistentChannelParams} from '../channel';
import {firstValueFrom} from 'rxjs';
import {take} from 'rxjs/operators';
import {of} from '../../util/of';

const setup = <T extends string | Uint8Array = string | Uint8Array>(
  params: Partial<PersistentChannelParams<T>> = {},
) => {
  let ws: MockWebSocket;
  const onClose = jest.fn();
  const onSend = jest.fn();
  const persistent = new PersistentChannel({
    ...params,
    newChannel: () =>
      new WebSocketChannel({
        newSocket: jest.fn(() => {
          const Socket = createWebSocketMock({
            onClose,
            onSend,
          });
          ws = new Socket('http://example.com');
          return ws;
        }),
      }),
  });
  return {
    ws: () => ws!,
    persistent,
    onClose,
    onSend,
  };
};

test('when WebSocket connects open$ state is set to "true"', async () => {
  const {ws, persistent} = setup();
  let channel: Channel<string | Uint8Array> | undefined;
  persistent.channel$.subscribe((ch) => {
    channel = ch;
  });
  expect(channel).toBe(undefined);
  expect(persistent.open$.getValue()).toBe(false);
  persistent.start();
  ws()._open();
  await new Promise((r) => setTimeout(r, 1));
  expect(channel).toBeInstanceOf(WebSocketChannel);
  expect(persistent.open$.getValue()).toBe(true);
});

describe('.start()', () => {
  test('initially persistent channel is not open, then automatically connects and sets the channel', async () => {
    const {persistent} = setup();
    let channel: Channel<string | Uint8Array> | undefined;
    persistent.channel$.subscribe((ch) => {
      channel = ch;
    });
    expect(channel).toBe(undefined);
    expect(persistent.open$.getValue()).toBe(false);
    persistent.start();
    await new Promise((r) => setTimeout(r, 1));
    expect(channel).toBeInstanceOf(WebSocketChannel);
    expect(persistent.open$.getValue()).toBe(false);
  });

  test('start life-cycle can be started using .start$ observable', async () => {
    const {ws, persistent} = setup();
    let channel: Channel<string | Uint8Array> | undefined;
    persistent.channel$.subscribe((ch) => {
      channel = ch;
    });
    expect(channel).toBe(undefined);
    expect(persistent.open$.getValue()).toBe(false);
    await new Promise((r) => setTimeout(r, 1));
    expect(channel).toBe(undefined);
    expect(persistent.open$.getValue()).toBe(false);
    persistent.start();
    expect(channel).toBeInstanceOf(WebSocketChannel);
    expect(persistent.open$.getValue()).toBe(false);
    ws()._open();
    await new Promise((r) => setTimeout(r, 1));
    expect(channel).toBeInstanceOf(WebSocketChannel);
    expect(persistent.open$.getValue()).toBe(true);
  });
});

describe('.stop()', () => {
  test('closes channel when .stop() is executed', async () => {
    const {ws, onSend, onClose, persistent} = setup();
    persistent.start();
    let channel: Channel<string | Uint8Array> | undefined;
    persistent.channel$.subscribe((ch) => {
      channel = ch;
    });
    await new Promise((r) => setTimeout(r, 1));
    ws()._open();
    await new Promise((r) => setTimeout(r, 1));
    await firstValueFrom(persistent.send$('asdf').pipe(take(1)));
    expect(onSend).toHaveBeenCalledTimes(1);
    expect(persistent.open$.getValue()).toBe(true);
    await firstValueFrom(persistent.send$('foo').pipe(take(1)));
    expect(onSend).toHaveBeenCalledTimes(2);
    expect(onClose).toHaveBeenCalledTimes(0);
    persistent.stop();
    await new Promise((r) => setTimeout(r, 1));
    expect(onSend).toHaveBeenCalledTimes(2);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('.send$() method', () => {
  test('sends out message to the channel when channel is connected', async () => {
    const {ws, onSend, persistent} = setup();
    persistent.start();
    let channel: Channel<string | Uint8Array> | undefined;
    persistent.channel$.subscribe((ch) => {
      channel = ch;
    });
    expect(onSend).toHaveBeenCalledTimes(0);
    expect(persistent.open$.getValue()).toBe(false);
    await new Promise((r) => setTimeout(r, 1));
    ws()._open();
    await new Promise((r) => setTimeout(r, 1));
    expect(onSend).toHaveBeenCalledTimes(0);
    expect(persistent.open$.getValue()).toBe(true);
    await firstValueFrom(persistent.send$('asdf').pipe(take(1)));
    expect(onSend).toHaveBeenCalledTimes(1);
    expect(onSend).toHaveBeenCalledWith('asdf');
    expect(persistent.open$.getValue()).toBe(true);
  });

  test('buffers and sends message out once channel is connected', async () => {
    const {ws, onSend, persistent} = setup();
    persistent.start();
    let channel: Channel<string | Uint8Array> | undefined;
    persistent.channel$.subscribe((ch) => {
      channel = ch;
    });
    expect(onSend).toHaveBeenCalledTimes(0);
    const future = of(firstValueFrom(persistent.send$(new Uint8Array([1, 2, 3])).pipe(take(1))));
    expect(onSend).toHaveBeenCalledTimes(0);
    await new Promise((r) => setTimeout(r, 1));
    ws()._open();
    await new Promise((r) => setTimeout(r, 1));
    await future;
    expect(onSend).toHaveBeenCalledTimes(1);
    expect(onSend).toHaveBeenCalledWith(new Uint8Array([1, 2, 3]));
  });

  test('does not send messages once .stop() is executed', async () => {
    const {ws, onSend, persistent} = setup();
    persistent.start();
    let channel: Channel<string | Uint8Array> | undefined;
    persistent.channel$.subscribe((ch) => {
      channel = ch;
    });
    await new Promise((r) => setTimeout(r, 1));
    ws()._open();
    await new Promise((r) => setTimeout(r, 1));
    await firstValueFrom(persistent.send$('asdf').pipe(take(1)));
    expect(onSend).toHaveBeenCalledTimes(1);
    await firstValueFrom(persistent.send$('foo').pipe(take(1)));
    expect(onSend).toHaveBeenCalledTimes(2);
    persistent.stop();
    const a = of(firstValueFrom(persistent.send$('bar').pipe(take(1))));
    await new Promise((r) => setTimeout(r, 1));
    ws()._open();
    await new Promise((r) => setTimeout(r, 1));
    expect(onSend).toHaveBeenCalledTimes(2);
  });
});
