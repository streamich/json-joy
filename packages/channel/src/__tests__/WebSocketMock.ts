import {utf8Size} from '@jsonjoy.com/util/lib/strings/utf8';
import {WebSocketState} from '../constants';
import {Subscription} from 'rxjs';
import {toUint8Array} from '@jsonjoy.com/buffers/lib/toUint8Array';
import {WebSocketMockServerConnection} from './WebSocketMockServerConnection';

export class CloseEvent {
  public readonly type = 'close';
  constructor(
    public readonly code: number,
    public readonly reason: string,
    public readonly wasClean: boolean
  ) {}
}

export interface WebSocketMockParams {
  connection?: WebSocketMockServerConnection;
}

export class WebSocketMock implements Pick<WebSocket, 'binaryType' | 'readyState' | 'bufferedAmount' | 'onopen' | 'onclose' | 'onerror' | 'onmessage' | 'close' | 'send'> {
  public static create(
    params: Partial<WebSocketMockParams>,
    url: string = 'http://127.0.0.1',
  ) {
    const ws = new WebSocketMock(params, url);
    return [ws, ws.controller];
  }

  public onclose: ((event: any) => void) | null = null;
  public onerror: ((event: Event) => void) | null = null;
  public onmessage: ((event: Event) => void) | null = null;
  public onopen: ((event: Event) => void) | null = null;

  public binaryType: 'arraybuffer' | 'blob' = 'blob';

  public _readyState: WebSocketState = WebSocketState.CONNECTING;
  public _bufferedAmount = 0;

  public get bufferedAmount(): number {
    return this._bufferedAmount;
  }

  public get readyState(): number {
    return this._readyState;
  }

  public _connectionSub: Subscription | null = null;

  public readonly controller = {
    readyState: WebSocketState.CLOSED,
    bufferedAmount: 0,

    open: (): void => {
      this._readyState = WebSocketState.OPEN;
      const event = {type: 'open'} as Event;
      this.onopen?.(event);
    },

    close: (code: number, reason: string, wasClean: boolean): void => {
      this._connectionSub?.unsubscribe();
      if (this.params.connection) {
        this.params.connection.outgoing$.complete();
        this.params.connection.incoming$.complete();
      }
      if (this._readyState === WebSocketState.CLOSED) throw new Error('Mock WebSocket already closed.');
      this._readyState = WebSocketState.CLOSED;
      const event = new CloseEvent(code, reason, wasClean);
      this.onclose?.(event);
    },

    error: (message: string): void => {
      const event = {type: 'error'} as Event;
      this.onerror?.(event);
      this.controller.close(1000, message, false);
    },

    message: (message: string | ArrayBuffer | ArrayBufferView): void => {
      if (!this.onmessage) return;
      const event = {type: 'message', data: message} as any;
      this.onmessage(event);
    }
  };

  constructor(
    public readonly params: Partial<WebSocketMockParams>,
    public readonly url: string = 'http://127.0.0.1',
  ) {
    const {connection} = params;
    if (connection) {
      this._connectionSub = connection.outgoing$.subscribe(data => {
        this.controller.message(data);
      });
    }
  }

  public close(code?: number, reason?: string): void {
    this.controller.close(code ?? 0, reason ?? '', true);
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
    if (this.params.connection) {
      if (data instanceof Blob) {
        data.bytes().then(buf => {
          this.params.connection?.incoming$.next(new Uint8Array(buf));
        });
      } else {
        const buf = toUint8Array(data);
        this.params.connection.incoming$.next(buf);
      }
    }
  }

}
