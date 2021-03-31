import {encodeAny} from "./util/encodeAny";

export class Encoder {
  private buf!: ArrayBuffer;
  private view!: DataView;

  constructor(size: number = 1024, private readonly maxBufferSize: number = 1024 * 1024) {
    this.allocate(size);
  }

  private allocate(size: number) {
    this.buf = new ArrayBuffer(size);
    this.view = new DataView(this.buf);
  }

  public encode(json: unknown): ArrayBuffer {
    try {
      return this.buf.slice(0, encodeAny(this.view, 0, json));
    } catch (error) {
      if (error instanceof RangeError) {
        const nextSize = this.buf.byteLength * 2;
        if (nextSize > this.maxBufferSize) throw error;
        this.allocate(nextSize);
        return this.encode(json);
      }
      throw error;
    }
  }
}
