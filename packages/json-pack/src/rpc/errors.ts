export class RpcDecodingError extends Error {
  constructor(message?: string) {
    super(message ? 'RPC_DECODING: ' + message : 'RPC_DECODING');
  }
}

export class RpcEncodingError extends Error {
  constructor(message?: string) {
    super(message ? 'RPC_ENCODING: ' + message : 'RPC_ENCODING');
  }
}
