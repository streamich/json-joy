import {WebSocketMock} from './WebSocketMock';
import {firstValueFrom} from 'rxjs';
import {take, toArray} from 'rxjs/operators';
import {of} from './of';
import {PersistentChannel, PersistentChannelParams} from '../PersistentChannel';
import {WebSocketChannel} from '../WebSocketChannel';
import {PhysicalChannel} from '../types';
import {WebSocketMockServerConnection} from './WebSocketMockServerConnection';

const setup = <T extends string | Uint8Array = string | Uint8Array>(
  params: Partial<PersistentChannelParams<T>> = {},
) => {
  let ws: WebSocketMock;
  const onClose = jest.fn();
  const onSend = jest.fn();
  const persistent = new PersistentChannel({
    ...params,
    newChannel: () => {
      const connection = new WebSocketMockServerConnection();
      ws = new WebSocketMock({connection}, 'http://example.com');
      const origClose = ws.close.bind(ws);
      ws.close = (code?: number, reason?: string) => { onClose(code, reason); origClose(code, reason); };
      const origSend = ws.send.bind(ws);
      ws.send = (data: any) => { onSend(data); origSend(data); };
      return new WebSocketChannel({ newSocket: () => ws }) as unknown as PhysicalChannel<T>;
    },
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
  let channel: PhysicalChannel<string | Uint8Array> | undefined;
  persistent.channel$.subscribe((ch) => {
    channel = ch;
  });
  expect(channel).toBe(undefined);
  expect(persistent.open$.getValue()).toBe(false);
  persistent.start();
  ws().controller.open();
  await new Promise((r) => setTimeout(r, 1));
  expect(channel).toBeInstanceOf(WebSocketChannel);
  expect(persistent.open$.getValue()).toBe(true);
});

describe('.start()', () => {
  test('initially persistent channel is not open, then automatically connects and sets the channel', async () => {
    const {persistent} = setup();
    let channel: PhysicalChannel<string | Uint8Array> | undefined;
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
    let channel: PhysicalChannel<string | Uint8Array> | undefined;
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
    ws().controller.open();
    await new Promise((r) => setTimeout(r, 1));
    expect(channel).toBeInstanceOf(WebSocketChannel);
    expect(persistent.open$.getValue()).toBe(true);
  });
});

describe('.stop()', () => {
  test('closes channel when .stop() is executed', async () => {
    const {ws, onSend, onClose, persistent} = setup();
    persistent.start();
    let channel: PhysicalChannel<string | Uint8Array> | undefined;
    persistent.channel$.subscribe((ch) => {
      channel = ch;
    });
    await new Promise((r) => setTimeout(r, 1));
    ws().controller.open();
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
    expect(channel).toBe(undefined);
  });
});

describe('.send$() method', () => {
  test('sends out message to the channel when channel is connected', async () => {
    const {ws, onSend, persistent} = setup();
    persistent.start();
    let channel: PhysicalChannel<string | Uint8Array> | undefined;
    persistent.channel$.subscribe((ch) => {
      channel = ch;
    });
    expect(onSend).toHaveBeenCalledTimes(0);
    expect(persistent.open$.getValue()).toBe(false);
    await new Promise((r) => setTimeout(r, 1));
    ws().controller.open();
    await new Promise((r) => setTimeout(r, 1));
    expect(onSend).toHaveBeenCalledTimes(0);
    expect(persistent.open$.getValue()).toBe(true);
    await firstValueFrom(persistent.send$('asdf').pipe(take(1)));
    expect(onSend).toHaveBeenCalledTimes(1);
    expect(onSend).toHaveBeenCalledWith('asdf');
    expect(persistent.open$.getValue()).toBe(true);
    expect(channel).not.toBe(undefined);
  });

  test('buffers and sends message out once channel is connected', async () => {
    const {ws, onSend, persistent} = setup();
    persistent.start();
    let channel: PhysicalChannel<string | Uint8Array> | undefined;
    persistent.channel$.subscribe((ch) => {
      channel = ch;
    });
    expect(onSend).toHaveBeenCalledTimes(0);
    const future = of(firstValueFrom(persistent.send$(new Uint8Array([1, 2, 3])).pipe(take(1))));
    expect(onSend).toHaveBeenCalledTimes(0);
    await new Promise((r) => setTimeout(r, 1));
    ws().controller.open();
    await new Promise((r) => setTimeout(r, 1));
    await future;
    expect(onSend).toHaveBeenCalledTimes(1);
    expect(onSend).toHaveBeenCalledWith(new Uint8Array([1, 2, 3]));
    expect(channel).not.toBe(undefined);
  });

  test('does not send messages once .stop() is executed', async () => {
    const {ws, onSend, persistent} = setup();
    persistent.start();
    let channel: PhysicalChannel<string | Uint8Array> | undefined;
    persistent.channel$.subscribe((ch) => {
      channel = ch;
    });
    await new Promise((r) => setTimeout(r, 1));
    ws().controller.open();
    await new Promise((r) => setTimeout(r, 1));
    await firstValueFrom(persistent.send$('asdf').pipe(take(1)));
    expect(onSend).toHaveBeenCalledTimes(1);
    await firstValueFrom(persistent.send$('foo').pipe(take(1)));
    expect(onSend).toHaveBeenCalledTimes(2);
    persistent.stop();
    of(firstValueFrom(persistent.send$('bar').pipe(take(1))));
    await new Promise((r) => setTimeout(r, 1));
    ws().controller.open();
    await new Promise((r) => setTimeout(r, 1));
    expect(onSend).toHaveBeenCalledTimes(2);
    expect(channel).toBe(undefined);
  });
});

describe('.start() idempotency', () => {
  test('calling .start() twice does not create two channels', () => {
    const {persistent} = setup();
    const channels: (PhysicalChannel<string | Uint8Array> | undefined)[] = [];
    persistent.channel$.subscribe((ch) => channels.push(ch));
    persistent.start();
    persistent.start();
    // Initial undefined + one channel creation
    expect(channels.length).toBe(2);
    expect(channels[0]).toBe(undefined);
    expect(channels[1]).toBeInstanceOf(WebSocketChannel);
  });
});

describe('.stop() edge cases', () => {
  test('calling .stop() before .start() is a no-op', () => {
    const {persistent} = setup();
    expect(persistent.active$.getValue()).toBe(false);
    persistent.stop();
    expect(persistent.active$.getValue()).toBe(false);
  });

  test('completes all subjects on stop', async () => {
    const {ws, persistent} = setup();
    persistent.start();
    ws().controller.open();
    await new Promise((r) => setTimeout(r, 1));
    const completions: string[] = [];
    persistent.active$.subscribe({complete: () => completions.push('active$')});
    persistent.channel$.subscribe({complete: () => completions.push('channel$')});
    persistent.open$.subscribe({complete: () => completions.push('open$')});
    persistent.error$.subscribe({complete: () => completions.push('error$')});
    persistent.stop();
    expect(completions).toEqual(
      expect.arrayContaining(['active$', 'channel$', 'open$', 'error$']),
    );
  });
});

describe('active$', () => {
  test('is false initially', () => {
    const {persistent} = setup();
    expect(persistent.active$.getValue()).toBe(false);
  });

  test('becomes true after .start(), false after .stop()', async () => {
    const {ws, persistent} = setup();
    const states: boolean[] = [];
    persistent.active$.subscribe((v) => states.push(v));
    persistent.start();
    ws().controller.open();
    await new Promise((r) => setTimeout(r, 1));
    persistent.stop();
    expect(states).toEqual([false, true, false]);
  });
});

describe('message$', () => {
  test('forwards messages from the underlying channel', async () => {
    const {ws, persistent} = setup();
    const messages: unknown[] = [];
    persistent.message$.subscribe((msg) => messages.push(msg));
    persistent.start();
    ws().controller.open();
    await new Promise((r) => setTimeout(r, 1));
    ws().controller.message('hello');
    ws().controller.message('world');
    expect(messages).toEqual(['hello', 'world']);
  });
});

describe('.reconnectDelay()', () => {
  test('returns 0 on first attempt', () => {
    const {persistent} = setup({minReconnectionDelay: 1000});
    expect(persistent.reconnectDelay()).toBe(0);
  });

  test('returns minReconnectionDelay on second attempt (retries = 1)', () => {
    const {persistent} = setup({minReconnectionDelay: 500});
    (persistent as any).retries = 1;
    expect(persistent.reconnectDelay()).toBe(500);
  });

  test('grows delay with each retry', () => {
    const {persistent} = setup({
      minReconnectionDelay: 100,
      reconnectionDelayGrowFactor: 2,
    });
    (persistent as any).retries = 1;
    const d1 = persistent.reconnectDelay();
    (persistent as any).retries = 2;
    const d2 = persistent.reconnectDelay();
    (persistent as any).retries = 3;
    const d3 = persistent.reconnectDelay();
    expect(d1).toBe(100);
    expect(d2).toBe(200);
    expect(d3).toBe(400);
  });

  test('caps at maxReconnectionDelay', () => {
    const {persistent} = setup({
      minReconnectionDelay: 1000,
      maxReconnectionDelay: 2000,
      reconnectionDelayGrowFactor: 10,
    });
    (persistent as any).retries = 5;
    expect(persistent.reconnectDelay()).toBe(2000);
  });
});

describe('reconnection', () => {
  test('creates a new channel after the current one closes', async () => {
    const {ws, persistent} = setup({minReconnectionDelay: 10});
    const channels: (PhysicalChannel<string | Uint8Array> | undefined)[] = [];
    persistent.channel$.subscribe((ch) => channels.push(ch));
    persistent.start();
    const firstChannel = channels[channels.length - 1];
    ws().controller.open();
    await new Promise((r) => setTimeout(r, 1));
    // Close the first channel
    ws().controller.close(1000, 'test', true);
    // Wait for reconnect delay
    await new Promise((r) => setTimeout(r, 50));
    const secondChannel = channels[channels.length - 1];
    expect(secondChannel).toBeInstanceOf(WebSocketChannel);
    expect(secondChannel).not.toBe(firstChannel);
    persistent.stop();
  });
});

describe('error$', () => {
  test('emits when newChannel() throws on start', () => {
    let callCount = 0;
    const errors: Error[] = [];
    const persistent = new PersistentChannel({
      newChannel: () => {
        callCount++;
        throw new Error('factory failed');
      },
    });
    persistent.error$.subscribe((e) => errors.push(e));
    persistent.start();
    expect(callCount).toBe(1);
    expect(errors.length).toBe(1);
    expect(errors[0].message).toBe('factory failed');
  });

  test('wraps non-Error throws into Error', () => {
    const errors: Error[] = [];
    const persistent = new PersistentChannel({
      newChannel: () => {
        throw 'string error';
      },
    });
    persistent.error$.subscribe((e) => errors.push(e));
    persistent.start();
    expect(errors.length).toBe(1);
    expect(errors[0]).toBeInstanceOf(Error);
    expect(errors[0].message).toBe('string error');
  });
});
