import {Subject} from 'rxjs';

/**
 * Represents a server-side connection, which is connected to a client WebSocket.
 */
export class WebSocketMockServerConnection {
  public incoming$: Subject<Uint8Array> = new Subject();
  public outgoing$: Subject<Uint8Array> = new Subject();
}
