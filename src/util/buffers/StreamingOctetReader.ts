const fromCharCode = String.fromCharCode;

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

  public utf8(length: number, mask: [number, number, number, number], maskIndex: number): string {
    this.assertSize(length);
    let i = 0;
    const points: number[] = [];
    while (i < length) {
      let code = this.u8() ^ mask[maskIndex++ % 4];
      i++;
      if ((code & 0x80) !== 0) {
        const octet2 = (this.u8() ^ mask[maskIndex++ % 4]) & 0x3f;
        i++;
        if ((code & 0xe0) === 0xc0) {
          code = ((code & 0x1f) << 6) | octet2;
        } else {
          const octet3 = (this.u8() ^ mask[maskIndex++ % 4]) & 0x3f;
          i++
          if ((code & 0xf0) === 0xe0) {
            code = ((code & 0x1f) << 12) | (octet2 << 6) | octet3;
          } else {
            if ((code & 0xf8) === 0xf0) {
              const octet4 = (this.u8() ^ mask[maskIndex++ % 4]) & 0x3f;
              i++;
              let unit = ((code & 0x07) << 0x12) | (octet2 << 0x0c) | (octet3 << 0x06) | octet4;
              if (unit > 0xffff) {
                unit -= 0x10000;
                const unit0 = ((unit >>> 10) & 0x3ff) | 0xd800;
                code = 0xdc00 | (unit & 0x3ff);
                points.push(unit0);
              } else {
                code = unit;
              }
            }
          }
        }
      }
      points.push(code);
    }
    return fromCharCode.apply(String, points);
  };
  
}
