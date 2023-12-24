export class StreamingOctetReader {
  protected readonly chunks: Uint8Array[] = [];

  /** Total size of all chunks. */
  protected chunkSize: number = 0;

  protected x: number = 0;

  public size(): number {
    return this.chunkSize - this.x;
  }

  public push(uint8: Uint8Array): void {
    this.chunks.push(uint8);
    this.chunkSize += uint8.length;
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

  public peak(): number {
    this.assertSize(1);
    return this.chunks[0]![this.x];
  }
}
