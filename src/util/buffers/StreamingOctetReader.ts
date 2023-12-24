export class StreamingOctetReader {
  protected readonly chunks: Uint8Array[] = [];

  /** Total size of all chunks. */
  protected chunkSize: number = 0;

  protected x: number = 0;

  public size(): number {
    return this.chunkSize - this.x;
  }

  public push(chunk: Uint8Array): void {
    this.chunks.push(chunk);
    this.chunkSize += chunk.length;
  }

  protected assertSize(size: number): void {
    if (size > this.size()) throw new RangeError('OUT_OF_BOUNDS');
  }

  public u8(): number {
    this.assertSize(1);
    const chunk = this.chunks[0]!;
    let x = this.x;
    const octet = chunk[x++];
    if (x === chunk.length) {
      this.chunks.shift();
      this.chunkSize -= chunk.length;
      x = 0;
    }
    this.x = x;
    return octet;
  }

  public u32(): number {
    const octet0 = this.u8();
    const octet1 = this.u8();
    const octet2 = this.u8();
    const octet3 = this.u8();
    return (octet0 * 0x1000000) + (octet1 << 16) + (octet2 << 8) | octet3;
  }

  public skip(n: number): void {
    this.assertSize(n);
    const chunk = this.chunks[0]!;
    let x = this.x + n;
    const length = chunk.length;
    if (x < length) {
      this.x = x;
      return;
    }
    this.x = 0;
    this.chunks.shift();
    this.chunkSize -= length;
    this.skip(x - length);
  }

  public peak(): number {
    this.assertSize(1);
    return this.chunks[0]![this.x];
  }
}
