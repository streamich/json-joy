export interface JsonRpc2RequestMessage {
  jsonrpc?: '2.0';
  id: number | string | null;
  method: string;
  params: unknown;
}

export interface JsonRpc2ResponseMessage {
  jsonrpc?: '2.0';
  id: number | string | null;
  result: unknown;
}

export interface JsonRpc2ErrorMessage {
  jsonrpc?: '2.0';
  id: number | string | null;
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
  params: unknown;
}

export type JsonRpc2Message =
  | JsonRpc2RequestMessage
  | JsonRpc2ResponseMessage
  | JsonRpc2ErrorMessage
  | JsonRpc2NotificationMessage;
