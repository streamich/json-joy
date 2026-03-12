import {WebSocketMockServerConnection} from './WebSocketMockServerConnection';
import {WebSocketMock} from './WebSocketMock';

export interface WebSocketMockFactoryParams {
  newConnection: () => WebSocketMockServerConnection;
  url?: string;
}

export class WebSocketMockFactory {
  constructor (public readonly params: WebSocketMockFactoryParams) {}

  public create(): [socket: WebSocketMock, connection: WebSocketMockServerConnection] {
    const params = this.params;
    const connection = params.newConnection();
    const socket = new WebSocketMock({connection}, params.url);
    return [socket, connection];
  }
}
