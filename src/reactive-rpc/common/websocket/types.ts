export type RxWebSocketBase = Pick<WebSocket, 'readyState' | 'bufferedAmount' | 'onopen' | 'onclose' | 'onerror' | 'onmessage' | 'close' | 'send'>;

export interface CloseEventBase {
  readonly code: number;
  readonly reason: string;
  readonly wasClean: boolean;
}
