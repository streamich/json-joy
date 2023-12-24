export class FrameHeader {
  constructor(
    public readonly fin: 0 | 1,
    public readonly opcode: number,
    public readonly length: number,
    public readonly mask: undefined | [number, number, number, number],
  ) {}
}
