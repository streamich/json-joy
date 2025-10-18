/**
 * Represents an SSH multiprecision integer (mpint).
 *
 * An mpint is stored in two's complement format, 8 bits per byte, MSB first.
 * According to RFC 4251:
 * - Negative numbers have the value 1 as the most significant bit of the first byte
 * - If the most significant bit would be set for a positive number, the number MUST be preceded by a zero byte
 * - Unnecessary leading bytes with the value 0 or 255 MUST NOT be included
 * - The value zero MUST be stored as a string with zero bytes of data
 */
export class JsonPackMpint {
  /**
   * The raw bytes representing the mpint in two's complement format, MSB first.
   */
  public readonly data: Uint8Array;

  constructor(data: Uint8Array) {
    this.data = data;
  }

  /**
   * Create an mpint from a BigInt value.
   */
  public static fromBigInt(value: bigint): JsonPackMpint {
    if (value === BigInt(0)) {
      return new JsonPackMpint(new Uint8Array(0));
    }

    const negative = value < BigInt(0);
    const bytes: number[] = [];

    if (negative) {
      // For negative numbers, work with two's complement
      const absValue = -value;
      const bitLength = absValue.toString(2).length;
      const byteLength = Math.ceil((bitLength + 1) / 8); // +1 for sign bit

      // Calculate two's complement
      const twoComplement = (BigInt(1) << BigInt(byteLength * 8)) + value;

      for (let i = byteLength - 1; i >= 0; i--) {
        bytes.push(Number((twoComplement >> BigInt(i * 8)) & BigInt(0xff)));
      }

      // Ensure MSB is 1 for negative numbers
      while (bytes.length > 0 && bytes[0] === 0xff && bytes.length > 1 && (bytes[1] & 0x80) !== 0) {
        bytes.shift();
      }
    } else {
      // For positive numbers
      let tempValue = value;
      while (tempValue > BigInt(0)) {
        bytes.unshift(Number(tempValue & BigInt(0xff)));
        tempValue >>= BigInt(8);
      }

      // Add leading zero if MSB is set (to indicate positive number)
      if (bytes[0] & 0x80) {
        bytes.unshift(0);
      }
    }

    return new JsonPackMpint(new Uint8Array(bytes));
  }

  /**
   * Convert the mpint to a BigInt value.
   */
  public toBigInt(): bigint {
    if (this.data.length === 0) {
      return BigInt(0);
    }

    const negative = (this.data[0] & 0x80) !== 0;

    if (negative) {
      // Two's complement for negative numbers
      let value = BigInt(0);
      for (let i = 0; i < this.data.length; i++) {
        value = (value << BigInt(8)) | BigInt(this.data[i]);
      }
      // Convert from two's complement
      const bitLength = this.data.length * 8;
      return value - (BigInt(1) << BigInt(bitLength));
    } else {
      // Positive number
      let value = BigInt(0);
      for (let i = 0; i < this.data.length; i++) {
        value = (value << BigInt(8)) | BigInt(this.data[i]);
      }
      return value;
    }
  }

  /**
   * Create an mpint from a number (limited to safe integer range).
   */
  public static fromNumber(value: number): JsonPackMpint {
    if (!Number.isInteger(value)) {
      throw new Error('Value must be an integer');
    }
    return JsonPackMpint.fromBigInt(BigInt(value));
  }

  /**
   * Convert the mpint to a number (throws if out of safe integer range).
   */
  public toNumber(): number {
    const bigIntValue = this.toBigInt();
    if (bigIntValue > BigInt(Number.MAX_SAFE_INTEGER) || bigIntValue < BigInt(Number.MIN_SAFE_INTEGER)) {
      throw new Error('Value is outside safe integer range');
    }
    return Number(bigIntValue);
  }
}
