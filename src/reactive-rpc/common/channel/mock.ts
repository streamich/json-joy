import {WebSocketState} from './constants';
import {utf8Size} from '@jsonjoy.com/json-pack/lib/util/strings/utf8';

export interface CreateWebSocketMockParams {
  onClose: (code?: number, reason?: string) => void;
  onSend: (data: string | ArrayBufferLike | Blob | ArrayBufferView) => void;
}

export interface MockWebSocket extends WebSocket {
  readonly _protocol: string | string[];
  _readyState: WebSocketState;
  _bufferedAmount: number;
  _extendParams(newParams: Partial<CreateWebSocketMockParams>): void;
  _open(): void;
  _close(code: number, reason: string, wasClean: boolean): void;
  _error(): void;
  _message(message: string | ArrayBuffer | ArrayBufferView): void;
}

export const createWebSocketMock = (params: Partial<CreateWebSocketMockParams>) => {
  const WebSocketMock = class WebSocketMock implements MockWebSocket {
    public static readonly CONNECTING = 0;
    public static readonly OPEN = 1;
    public static readonly CLOSING = 2;
    public static readonly CLOSED = 3;

    public readonly CONNECTING = 0;
    public readonly OPEN = 1;
    public readonly CLOSING = 2;
    public readonly CLOSED = 3;

    public onclose = null;
    public onerror = null;
    public onmessage = null;
    public onopen = null;

    public binaryType: 'arraybuffer' | 'blob' = 'blob';

    public _readyState: WebSocketState = WebSocketState.CONNECTING;
    public _bufferedAmount: number = 0;

    public get bufferedAmount(): number {
      return this._bufferedAmount;
    }

    public get extensions(): string {
      return '';
    }

    public get protocol(): string {
      return this._protocol instanceof Array ? this._protocol.join(',') : this._protocol;
    }

    public get readyState(): number {
      return this._readyState;
    }

    constructor(
      public readonly url: string,
      public readonly _protocol: string | string[] = '',
    ) {}

    public close(code?: number, reason?: string): void {
      if (!params.onClose) return;
      return params.onClose(code, reason);
    }

    public send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void {
      if (typeof data === 'string') {
        this._bufferedAmount += utf8Size(data);
      } else if (ArrayBuffer.isView(data)) {
        this._bufferedAmount += data.byteLength;
      } else if (data && typeof data === 'object') {
        if ((data as any).byteLength !== undefined) {
          this._bufferedAmount += Number((data as any).byteLength);
        } else if ((data as unknown as Blob).size !== undefined) {
          this._bufferedAmount += Number((data as unknown as Blob).size);
        }
      }
      if (!params.onSend) return;
      return params.onSend(data);
    }

    public addEventListener() {
      throw new Error('not implemented');
    }

    public removeEventListener() {
      throw new Error('not implemented');
    }

    public dispatchEvent(): boolean {
      throw new Error('not implemented');
    }

    public _extendParams(newParams: Partial<CreateWebSocketMockParams>): void {
      Object.assign(params, newParams);
    }

    public _open() {
      this._readyState = WebSocketState.OPEN;
      if (typeof this.onopen === 'function') {
        (this.onopen as any).call(this, new Event('open'));
      }
    }

    public _close(code: number, reason: string, wasClean: boolean): void {
      if (this._readyState === WebSocketState.CLOSED) throw new Error('Mock WebSocket already closed.');
      this._readyState = WebSocketState.CLOSED;
      if (!this.onclose) return;
      const event: Pick<CloseEvent, 'code' | 'reason' | 'wasClean'> = {
        code,
        reason,
        wasClean,
      };
      (this.onclose as any).call(this, event);
    }

    public _error() {
      if (!this.onerror) return;
      (this.onerror as any).call(this, new Event('error'));
    }

    public _message(message: string | ArrayBuffer | ArrayBufferView): void {
      if (!this.onmessage) return;
      const event = {data: message};
      (this.onmessage as any).call(this, event);
    }
  };

  return WebSocketMock;
};
