export class WsFrameDecodingError extends Error {
  constructor() {
    super('WS_FRAME_DECODING');
  }
}

export class WsFrameEncodingError extends Error {
  constructor() {
    super('WS_FRAME_ENCODING');
  }
}
