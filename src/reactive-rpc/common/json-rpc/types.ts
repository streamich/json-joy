export interface JsonRpc2RequestMessage {
  jsonrpc?: '2.0';
  id: JsonRpc2Id;
  method: string;
  params?: unknown;
}

export interface JsonRpc2ResponseMessage {
  jsonrpc?: '2.0';
  id: JsonRpc2Id;
  result: unknown;
}

export interface JsonRpc2ErrorMessage {
  jsonrpc?: '2.0';
  id: JsonRpc2Id;
  error: JsonRpc2Error;
}

export interface JsonRpc2Error {
  code: number;
  message: string;
  data?: unknown;
}

export interface JsonRpc2NotificationMessage {
  jsonrpc?: '2.0';
  method: string;
  params?: unknown;
}

export type JsonRpc2Id = number | string | null;

export type JsonRpc2IncomingMessage = JsonRpc2RequestMessage | JsonRpc2NotificationMessage;
export type JsonRpc2OutgoingMessage = JsonRpc2ResponseMessage | JsonRpc2ErrorMessage;

export type JsonRpc2Message =
  | JsonRpc2IncomingMessage
  | JsonRpc2OutgoingMessage;
