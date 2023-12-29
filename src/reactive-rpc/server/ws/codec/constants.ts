export const enum WsFrameOpcode {
  // Continuation fragment of a data frame
  CONTINUE = 0,

  // Data frames
  TEXT = 1,
  BINARY = 2,

  // Control frames
  MIN_CONTROL_OPCODE = 8,
  CLOSE = 8,
  PING = 9,
  PONG = 10,
}
