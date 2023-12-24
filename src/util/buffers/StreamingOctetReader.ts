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
    return (octet0 * 0x1000000 + (octet1 << 16) + (octet2 << 8)) | octet3;
  }

  public copy(size: number, dst: Uint8Array, pos: number): void {
    if (!size) return;
    this.assertSize(size);
    const chunk0 = this.chunks[0]!;
    const size0 = Math.min(chunk0.length - this.x, size);
    dst.set(chunk0.subarray(this.x, this.x + size0), pos);
    size -= size0;
    if (size <= 0) {
      this.skipUnsafe(size0);
      return;
    }
    let chunkIndex = 1;
    while (size > 0) {
      const chunk1 = this.chunks[chunkIndex]!;
      const size1 = Math.min(chunk1.length, size);
      dst.set(chunk1.subarray(0, size1), pos + size0);
      size -= size1;
      chunkIndex++;
    }
    this.skipUnsafe(size);
  }

  public copyXor(
    size: number,
    dst: Uint8Array,
    pos: number,
    mask: [number, number, number, number],
    maskIndex: number,
  ): void {
    if (!size) return;
    this.assertSize(size);
    const chunk0 = this.chunks[0]!;
    const size0 = Math.min(chunk0.length - this.x, size);
    for (let i = 0; i < size0; i++) dst[pos + i] = chunk0[this.x + i] ^ mask[maskIndex++ % 4];
    size -= size0;
    pos += size0;
    if (size <= 0) {
      this.skipUnsafe(size0);
      return;
    }
    let chunkIndex = 1;
    while (size > 0) {
      const chunk1 = this.chunks[chunkIndex]!;
      const size1 = Math.min(chunk1.length, size);
      for (let i = 0; i < size1; i++) dst[pos + size0 + i] = chunk1[i] ^ mask[maskIndex++ % 4];
      size -= size1;
      pos += size1;
      chunkIndex++;
    }
    this.skipUnsafe(size);
  }

  public skipUnsafe(n: number): void {
    if (!n) return;
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

  public skip(n: number): void {
    this.assertSize(n);
    this.skipUnsafe(n);
  }

  public peak(): number {
    this.assertSize(1);
    return this.chunks[0]![this.x];
  }
}
