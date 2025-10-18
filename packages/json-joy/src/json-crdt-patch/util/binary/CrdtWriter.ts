import {Writer} from '@jsonjoy.com/buffers/lib/Writer';

export class CrdtWriter extends Writer {
  /**
   * In the below encoding diagrams bits are annotated as follows:
   *
   * - "x" - vector table index, reference to the logical clock.
   * - "y" - time difference.
   * - "?" - whether the next byte is used for encoding.
   *
   * If x is less than 8 and y is less than 16, the relative ID is encoded as a
   * single byte:
   *
   * ```
   * +--------+
   * |0xxxyyyy|
   * +--------+
   * ```
   *
   * Otherwise the top bit of the first byte is set to 1; and x and y are encoded
   * separately using b1vuint28 and vuint39, respectively.
   *
   * ```
   *       x          y
   * +===========+=========+
   * | b1vuint28 | vuint39 |
   * +===========+=========+
   * ```
   *
   * The boolean flag of x b1vuint28 value is always set to 1.
   */
  public id(x: number, y: number): void {
    if (x <= 0b111 && y <= 0b1111) {
      this.u8((x << 4) | y);
    } else {
      this.b1vu56(1, x);
      this.vu57(y);
    }
  }

  /**
   * #### `vu57`
   *
   * `vu57` stands for *variable length unsigned 57 bit integer*. It consumes
   * up to 8 bytes. The maximum size of the decoded value is 57 bits.
   *
   * The high bit `?` of each octet indicates if the next byte should be
   * consumed, up to 8 bytes. When `?` is set to `0`, it means that the current
   * byte is the last byte of the encoded value.
   *
   * ```
   *  byte 1   byte 2   byte 3   byte 4   byte 5   byte 6   byte 7   byte 8
   * +--------+........+........+........+........+........+........+········+
   * |?zzzzzzz|?zzzzzzz|?zzzzzzz|?zzzzzzz|?zzzzzzz|?zzzzzzz|?zzzzzzz|zzzzzzzz|
   * +--------+........+........+........+........+........+........+········+
   *
   *            11111    2211111  2222222  3333332  4443333  4444444 55555555
   *   7654321  4321098  1098765  8765432  5432109  2109876  9876543 76543210
   *     |                        |                    |             |
   *     5th bit of z             |                    |             |
   *                              28th bit of z        |             57th bit of z
   *                                                   39th bit of z
   * ```
   *
   * @param num Number to encode as variable length unsigned 57 bit integer.
   */
  public vu57(num: number) {
    if (num <= 0b1111111) {
      this.u8(num);
    } else if (num <= 0b1111111_1111111) {
      this.ensureCapacity(2);
      const uint8 = this.uint8;
      uint8[this.x++] = 0b10000000 | (num & 0b01111111);
      uint8[this.x++] = num >>> 7;
    } else if (num <= 0b1111111_1111111_1111111) {
      this.ensureCapacity(3);
      const uint8 = this.uint8;
      uint8[this.x++] = 0b10000000 | (num & 0b01111111);
      uint8[this.x++] = 0b10000000 | ((num >>> 7) & 0b01111111);
      uint8[this.x++] = num >>> 14;
    } else if (num <= 0b1111111_1111111_1111111_1111111) {
      this.ensureCapacity(4);
      const uint8 = this.uint8;
      uint8[this.x++] = 0b10000000 | (num & 0b01111111);
      uint8[this.x++] = 0b10000000 | ((num >>> 7) & 0b01111111);
      uint8[this.x++] = 0b10000000 | ((num >>> 14) & 0b01111111);
      uint8[this.x++] = num >>> 21;
    } else {
      let lo32 = num | 0;
      if (lo32 < 0) lo32 += 4294967296;
      const hi32 = (num - lo32) / 4294967296;
      if (num <= 0b1111111_1111111_1111111_1111111_1111111) {
        this.ensureCapacity(5);
        const uint8 = this.uint8;
        uint8[this.x++] = 0b10000000 | (num & 0b01111111);
        uint8[this.x++] = 0b10000000 | ((num >>> 7) & 0b01111111);
        uint8[this.x++] = 0b10000000 | ((num >>> 14) & 0b01111111);
        uint8[this.x++] = 0b10000000 | ((num >>> 21) & 0b01111111);
        uint8[this.x++] = (hi32 << 4) | (num >>> 28);
      } else if (num <= 0b1111111_1111111_1111111_1111111_1111111_1111111) {
        this.ensureCapacity(6);
        const uint8 = this.uint8;
        uint8[this.x++] = 0b10000000 | (num & 0b01111111);
        uint8[this.x++] = 0b10000000 | ((num >>> 7) & 0b01111111);
        uint8[this.x++] = 0b10000000 | ((num >>> 14) & 0b01111111);
        uint8[this.x++] = 0b10000000 | ((num >>> 21) & 0b01111111);
        uint8[this.x++] = 0b10000000 | ((hi32 & 0b111) << 4) | (num >>> 28);
        uint8[this.x++] = hi32 >>> 3;
      } else if (num <= 0b1111111_1111111_1111111_1111111_1111111_1111111_1111111) {
        this.ensureCapacity(7);
        const uint8 = this.uint8;
        uint8[this.x++] = 0b10000000 | (num & 0b01111111);
        uint8[this.x++] = 0b10000000 | ((num >>> 7) & 0b01111111);
        uint8[this.x++] = 0b10000000 | ((num >>> 14) & 0b01111111);
        uint8[this.x++] = 0b10000000 | ((num >>> 21) & 0b01111111);
        uint8[this.x++] = 0b10000000 | ((hi32 & 0b111) << 4) | (num >>> 28);
        uint8[this.x++] = 0b10000000 | ((hi32 & 0b1111111_000) >>> 3);
        uint8[this.x++] = hi32 >>> 10;
      } else {
        this.ensureCapacity(8);
        const uint8 = this.uint8;
        uint8[this.x++] = 0b10000000 | (num & 0b01111111);
        uint8[this.x++] = 0b10000000 | ((num >>> 7) & 0b01111111);
        uint8[this.x++] = 0b10000000 | ((num >>> 14) & 0b01111111);
        uint8[this.x++] = 0b10000000 | ((num >>> 21) & 0b01111111);
        uint8[this.x++] = 0b10000000 | ((hi32 & 0b111) << 4) | (num >>> 28);
        uint8[this.x++] = 0b10000000 | ((hi32 & 0b1111111_000) >>> 3);
        uint8[this.x++] = 0b10000000 | ((hi32 & 0b1111111_0000000_000) >>> 10);
        uint8[this.x++] = hi32 >>> 17;
      }
    }
  }

  /**
   * #### `b1vu56`
   *
   * `b1vu56` stands for: 1 bit flag followed by variable length unsigned 56 bit integer.
   * It consumes up to 8 bytes.
   *
   * The high bit "?" of each byte indicates if the next byte should be
   * consumed, up to 8 bytes.
   *
   * - f - flag
   * - z - variable length unsigned 56 bit integer
   * - ? - whether the next byte is used for encoding
   *
   * ```
   * byte 1                                                         byte 8
   * +--------+........+........+........+........+........+........+········+
   * |f?zzzzzz|?zzzzzzz|?zzzzzzz|?zzzzzzz|?zzzzzzz|?zzzzzzz|?zzzzzzz|zzzzzzzz|
   * +--------+........+........+........+........+........+........+········+
   *
   *            1111     2111111  2222222  3333322  4433333  4444444 55555554
   *    654321  3210987  0987654  7654321  4321098  1098765  8765432 65432109
   *     |                        |                    |             |
   *     5th bit of z             |                    |             |
   *                              27th bit of z        |             56th bit of z
   *                                                   38th bit of z
   * ```
   *
   * @param num Number to encode as variable length unsigned 56 bit integer.
   */
  public b1vu56(flag: 0 | 1, num: number) {
    if (num <= 0b111111) {
      this.u8((flag << 7) | num);
    } else {
      const firstByteMask = (flag << 7) | 0b1000000;
      if (num <= 0b1111111_111111) {
        this.ensureCapacity(2);
        const uint8 = this.uint8;
        uint8[this.x++] = firstByteMask | (num & 0b00111111);
        uint8[this.x++] = num >>> 6;
      } else if (num <= 0b1111111_1111111_111111) {
        this.ensureCapacity(3);
        const uint8 = this.uint8;
        uint8[this.x++] = firstByteMask | (num & 0b00111111);
        uint8[this.x++] = 0b10000000 | ((num >>> 6) & 0b01111111);
        uint8[this.x++] = num >>> 13;
      } else if (num <= 0b1111111_1111111_1111111_111111) {
        this.ensureCapacity(4);
        const uint8 = this.uint8;
        uint8[this.x++] = firstByteMask | (num & 0b00111111);
        uint8[this.x++] = 0b10000000 | ((num >>> 6) & 0b01111111);
        uint8[this.x++] = 0b10000000 | ((num >>> 13) & 0b01111111);
        uint8[this.x++] = num >>> 20;
      } else {
        let lo32 = num | 0;
        if (lo32 < 0) lo32 += 4294967296;
        const hi32 = (num - lo32) / 4294967296;
        if (num <= 0b1111111_1111111_1111111_1111111_111111) {
          this.ensureCapacity(5);
          const uint8 = this.uint8;
          uint8[this.x++] = firstByteMask | (num & 0b00111111);
          uint8[this.x++] = 0b10000000 | ((num >>> 6) & 0b01111111);
          uint8[this.x++] = 0b10000000 | ((num >>> 13) & 0b01111111);
          uint8[this.x++] = 0b10000000 | ((num >>> 20) & 0b01111111);
          uint8[this.x++] = (hi32 << 5) | (num >>> 27);
        } else if (num <= 0b1111111_1111111_1111111_1111111_1111111_111111) {
          this.ensureCapacity(6);
          const uint8 = this.uint8;
          uint8[this.x++] = firstByteMask | (num & 0b00111111);
          uint8[this.x++] = 0b10000000 | ((num >>> 6) & 0b01111111);
          uint8[this.x++] = 0b10000000 | ((num >>> 13) & 0b01111111);
          uint8[this.x++] = 0b10000000 | ((num >>> 20) & 0b01111111);
          uint8[this.x++] = 0b10000000 | ((hi32 & 0b11) << 5) | (num >>> 27);
          uint8[this.x++] = hi32 >>> 2;
        } else if (num <= 0b1111111_1111111_1111111_1111111_1111111_1111111_111111) {
          this.ensureCapacity(7);
          const uint8 = this.uint8;
          uint8[this.x++] = firstByteMask | (num & 0b00111111);
          uint8[this.x++] = 0b10000000 | ((num >>> 6) & 0b01111111);
          uint8[this.x++] = 0b10000000 | ((num >>> 13) & 0b01111111);
          uint8[this.x++] = 0b10000000 | ((num >>> 20) & 0b01111111);
          uint8[this.x++] = 0b10000000 | ((hi32 & 0b11) << 5) | (num >>> 27);
          uint8[this.x++] = 0b10000000 | ((hi32 & 0b1111111_00) >>> 2);
          uint8[this.x++] = hi32 >>> 9;
        } else {
          this.ensureCapacity(8);
          const uint8 = this.uint8;
          uint8[this.x++] = firstByteMask | (num & 0b00111111);
          uint8[this.x++] = 0b10000000 | ((num >>> 6) & 0b01111111);
          uint8[this.x++] = 0b10000000 | ((num >>> 13) & 0b01111111);
          uint8[this.x++] = 0b10000000 | ((num >>> 20) & 0b01111111);
          uint8[this.x++] = 0b10000000 | ((hi32 & 0b11) << 5) | (num >>> 27);
          uint8[this.x++] = 0b10000000 | ((hi32 & 0b1111111_00) >>> 2);
          uint8[this.x++] = 0b10000000 | ((hi32 & 0b1111111_0000000_00) >>> 9);
          uint8[this.x++] = hi32 >>> 16;
        }
      }
    }
  }
}
