export interface CreateWebSocketMockParams {
  onClose: (code?: number, reason?: string) => void;
  onSend: (data: string | ArrayBufferLike | Blob | ArrayBufferView) => void;
}

export const createWebSocketMock = (params: Partial<CreateWebSocketMockParams>) => {
  const WebSocketMock = class WebSocketMock implements WebSocket {
    public static readonly CONNECTING = 0;
    public static readonly OPEN = 1;
    public static readonly CLOSING = 2;
    public static readonly CLOSED = 3;
  
    public readonly CONNECTING = 0;
    public readonly OPEN = 1;
    public readonly CLOSING = 2;
    public readonly CLOSED = 3;
  
    public onclose: null;
    public onerror: null;
    public onmessage: null;
    public onopen: null;
  
    public binaryType: 'arraybuffer' | 'blob' = 'blob';
  
    public get bufferedAmount(): number {
      return 0;
    }
  
    public get extensions(): string {
      return '';
    }
  
    public get protocol(): string {
      return this._protocol instanceof Array
        ? this._protocol.join(',')
        : this._protocol;
    }
  
    public get readyState(): number {
      return 0;
    }
  
    constructor(public readonly url: string, public readonly _protocol: string | string[] = '') {}
    
    public close(code?: number, reason?: string): void {
      if (!params.onClose) return;
      return params.onClose(code, reason);
    }
  
    public send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void {
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
  };

  return WebSocketMock;
};
