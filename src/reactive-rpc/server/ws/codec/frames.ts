export class WsFrameHeader {
  constructor(
    public readonly fin: 0 | 1,
    public readonly opcode: number,
    public readonly length: number,
    public readonly mask: undefined | [number, number, number, number],
  ) {}
}

export class WsPingFrame extends WsFrameHeader {
  constructor(
    fin: 0 | 1,
    opcode: number,
    length: number,
    mask: undefined | [number, number, number, number],
    public readonly data: Uint8Array,
  ) {
    super(fin, opcode, length, mask);
  }
}

export class WsPongFrame extends WsFrameHeader {
  constructor(
    fin: 0 | 1,
    opcode: number,
    length: number,
    mask: undefined | [number, number, number, number],
    public readonly data: Uint8Array,
  ) {
    super(fin, opcode, length, mask);
  }
}

export class WsCloseFrame extends WsFrameHeader {
  constructor(
    fin: 0 | 1,
    opcode: number,
    length: number,
    mask: undefined | [number, number, number, number],
    public code: number,
    public reason: string,
  ) {
    super(fin, opcode, length, mask);
  }
}
