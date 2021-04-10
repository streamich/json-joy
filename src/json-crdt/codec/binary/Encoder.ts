import {Encoder as JsonPackEncoder} from '../../../json-pack/Encoder';

export class Encoder extends JsonPackEncoder {
  public vuint57(num: number) {
    if (num <= 0b1111111) {
      this.u8(num);
    } else if (num <= 0b1111111_1111111) {
      this.u8(0b10000000 | (num & 0b01111111));
      this.u8(num >>> 7);
    } else if (num <= 0b1111111_1111111_1111111) {
      this.u8(0b10000000 | (num & 0b01111111));
      this.u8(0b10000000 | ((num >>> 7) & 0b01111111));
      this.u8(num >>> 14);
    } else if (num <= 0b1111111_1111111_1111111_1111111) {
      this.u8(0b10000000 | (num & 0b01111111));
      this.u8(0b10000000 | ((num >>> 7) & 0b01111111));
      this.u8(0b10000000 | ((num >>> 14) & 0b01111111));
      this.u8(num >>> 21);
    } else {
      let lo32 = num | 0;
      if (lo32 < 0) lo32 += 4294967296;
      const hi32 = (num - lo32) / 4294967296;
      if (num <= 0b1111111_1111111_1111111_1111111_1111111) {
        this.u8(0b10000000 | (num & 0b01111111));
        this.u8(0b10000000 | ((num >>> 7) & 0b01111111));
        this.u8(0b10000000 | ((num >>> 14) & 0b01111111));
        this.u8(0b10000000 | ((num >>> 21) & 0b01111111));
        this.u8((hi32 << 4) | (num >>> 28));
      } else if (num <= 0b1111111_1111111_1111111_1111111_1111111_1111111) {
        this.u8(0b10000000 | (num & 0b01111111));
        this.u8(0b10000000 | ((num >>> 7) & 0b01111111));
        this.u8(0b10000000 | ((num >>> 14) & 0b01111111));
        this.u8(0b10000000 | ((num >>> 21) & 0b01111111));
        this.u8(0b10000000 | ((hi32 & 0b111) << 4) | (num >>> 28));
        this.u8(hi32 >>> 3);
      } else if (num <= 0b1111111_1111111_1111111_1111111_1111111_1111111_1111111) {
        this.u8(0b10000000 | (num & 0b01111111));
        this.u8(0b10000000 | ((num >>> 7) & 0b01111111));
        this.u8(0b10000000 | ((num >>> 14) & 0b01111111));
        this.u8(0b10000000 | ((num >>> 21) & 0b01111111));
        this.u8(0b10000000 | ((hi32 & 0b111) << 4) | (num >>> 28));
        this.u8(0b10000000 | ((hi32 & 0b1111111_000) >>> 3));
        this.u8(hi32 >>> 10);
      } else {
        this.u8(0b10000000 | (num & 0b01111111));
        this.u8(0b10000000 | ((num >>> 7) & 0b01111111));
        this.u8(0b10000000 | ((num >>> 14) & 0b01111111));
        this.u8(0b10000000 | ((num >>> 21) & 0b01111111));
        this.u8(0b10000000 | ((hi32 & 0b111) << 4) | (num >>> 28));
        this.u8(0b10000000 | ((hi32 & 0b1111111_000) >>> 3));
        this.u8(0b10000000 | ((hi32 & 0b1111111_0000000_000) >>> 10));
        this.u8(hi32 >>> 17);
      }
    }
  }

  public vuint39(num: number) {
    if (num <= 0b1111111) {
      this.u8(num);
    } else if (num <= 0b1111111_1111111) {
      this.u8(0b10000000 | (num & 0b01111111));
      this.u8(num >>> 7);
    } else if (num <= 0b1111111_1111111_1111111) {
      this.u8(0b10000000 | (num & 0b01111111));
      this.u8(0b10000000 | ((num >>> 7) & 0b01111111));
      this.u8(num >>> 14);
    } else if (num <= 0b1111111_1111111_1111111_1111111) {
      this.u8(0b10000000 | (num & 0b01111111));
      this.u8(0b10000000 | ((num >>> 7) & 0b01111111));
      this.u8(0b10000000 | ((num >>> 14) & 0b01111111));
      this.u8(num >>> 21);
    } else {
      let lo32 = num | 0;
      if (lo32 < 0) lo32 += 4294967296;
      const hi32 = (num - lo32) / 4294967296;
      if (num <= 0b1111111_1111111_1111111_1111111_1111111) {
        this.u8(0b10000000 | (num & 0b01111111));
        this.u8(0b10000000 | ((num >>> 7) & 0b01111111));
        this.u8(0b10000000 | ((num >>> 14) & 0b01111111));
        this.u8(0b10000000 | ((num >>> 21) & 0b01111111));
        this.u8((hi32 << 4) | (num >>> 28));
      } else if (num <= 0b1111111_1111111_1111111_1111111_1111111_1111111) {
        this.u8(0b10000000 | (num & 0b01111111));
        this.u8(0b10000000 | ((num >>> 7) & 0b01111111));
        this.u8(0b10000000 | ((num >>> 14) & 0b01111111));
        this.u8(0b10000000 | ((num >>> 21) & 0b01111111));
        this.u8(0b10000000 | ((hi32 & 0b111) << 4) | (num >>> 28));
        this.u8((hi32 >>> 3) & 0b1111);
      }
    }
  }

  public b1vuint56(flag: boolean, num: number) {
    if (num <= 0b111111) {
      this.u8((flag ? 0b10000000 : 0b00000000) | num);
    } else {
      const firstByteMask = flag ? 0b11000000 : 0b01000000;
      if (num <= 0b1111111_111111) {
        this.u8(firstByteMask | (num & 0b00111111));
        this.u8(num >>> 6);
      } else if (num <= 0b1111111_1111111_111111) {
        this.u8(firstByteMask | (num & 0b00111111));
        this.u8(0b10000000 | ((num >>> 6) & 0b01111111));
        this.u8(num >>> 13);
      } else if (num <= 0b1111111_1111111_1111111_111111) {
        this.u8(firstByteMask | (num & 0b00111111));
        this.u8(0b10000000 | ((num >>> 6) & 0b01111111));
        this.u8(0b10000000 | ((num >>> 13) & 0b01111111));
        this.u8(num >>> 20);
      } else {
        let lo32 = num | 0;
        if (lo32 < 0) lo32 += 4294967296;
        const hi32 = (num - lo32) / 4294967296;
        if (num <= 0b1111111_1111111_1111111_1111111_111111) {
          this.u8(firstByteMask | (num & 0b00111111));
          this.u8(0b10000000 | ((num >>> 6) & 0b01111111));
          this.u8(0b10000000 | ((num >>> 13) & 0b01111111));
          this.u8(0b10000000 | ((num >>> 20) & 0b01111111));
          this.u8((hi32 << 5) | (num >>> 27));
        } else if (num <= 0b1111111_1111111_1111111_1111111_1111111_111111) {
          this.u8(firstByteMask | (num & 0b00111111));
          this.u8(0b10000000 | ((num >>> 6) & 0b01111111));
          this.u8(0b10000000 | ((num >>> 13) & 0b01111111));
          this.u8(0b10000000 | ((num >>> 20) & 0b01111111));
          this.u8(0b10000000 | ((hi32 & 0b11) << 5) | (num >>> 27));
          this.u8(hi32 >>> 2);
        } else if (num <= 0b1111111_1111111_1111111_1111111_1111111_1111111_111111) {
          this.u8(firstByteMask | (num & 0b00111111));
          this.u8(0b10000000 | ((num >>> 6) & 0b01111111));
          this.u8(0b10000000 | ((num >>> 13) & 0b01111111));
          this.u8(0b10000000 | ((num >>> 20) & 0b01111111));
          this.u8(0b10000000 | ((hi32 & 0b11) << 5) | (num >>> 27));
          this.u8(0b10000000 | ((hi32 & 0b1111111_00) >>> 2));
          this.u8(hi32 >>> 9);
        } else {
          this.u8(firstByteMask | (num & 0b00111111));
          this.u8(0b10000000 | ((num >>> 6) & 0b01111111));
          this.u8(0b10000000 | ((num >>> 13) & 0b01111111));
          this.u8(0b10000000 | ((num >>> 20) & 0b01111111));
          this.u8(0b10000000 | ((hi32 & 0b11) << 5) | (num >>> 27));
          this.u8(0b10000000 | ((hi32 & 0b1111111_00) >>> 2));
          this.u8(0b10000000 | ((hi32 & 0b1111111_0000000_000) >>> 9));
          this.u8(hi32 >>> 16);
        }
      }
    }
  }

  public b1vuint28(flag: boolean, num: number) {
    if (num <= 0b111111) {
      this.u8((flag ? 0b10000000 : 0b00000000) | num);
    } else {
      const firstByteMask = flag ? 0b11000000 : 0b01000000;
      if (num <= 0b1111111_111111) {
        this.u8(firstByteMask | (num & 0b00111111));
        this.u8(num >>> 6);
      } else if (num <= 0b1111111_1111111_111111) {
        this.u8(firstByteMask | (num & 0b00111111));
        this.u8(0b10000000 | ((num >>> 6) & 0b01111111));
        this.u8(num >>> 13);
      } else {
        this.u8(firstByteMask | (num & 0b00111111));
        this.u8(0b10000000 | ((num >>> 6) & 0b01111111));
        this.u8(0b10000000 | ((num >>> 13) & 0b01111111));
        this.u8(num >>> 20);
      }
    }
  }
}
