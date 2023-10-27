import {Reader} from '../../../util/buffers/Reader';

export class CrdtReader extends Reader {
  public id(): [x: number, y: number] {
    const byte = this.u8();
    if (byte <= 0b0_111_1111) return [byte >>> 4, byte & 0b1111];
    this.x--;
    return [this.b1vu28()[1], this.vu39()];
  }

  public idSkip(): void {
    const byte = this.u8();
    if (byte <= 0b0_111_1111) return;
    this.x--;
    this.b1vu28Skip();
    this.vu39Skip();
  }

  public vu57(): number {
    const o1 = this.u8();
    if (o1 <= 0b01111111) return o1;
    const o2 = this.u8();
    if (o2 <= 0b01111111) return (o2 << 7) | (o1 & 0b01111111);
    const o3 = this.u8();
    if (o3 <= 0b01111111) return (o3 << 14) | ((o2 & 0b01111111) << 7) | (o1 & 0b01111111);
    const o4 = this.u8();
    if (o4 <= 0b01111111) return (o4 << 21) | ((o3 & 0b01111111) << 14) | ((o2 & 0b01111111) << 7) | (o1 & 0b01111111);
    const o5 = this.u8();
    if (o5 <= 0b01111111)
      return (
        o5 * 0b10000000000000000000000000000 +
        (((o4 & 0b01111111) << 21) | ((o3 & 0b01111111) << 14) | ((o2 & 0b01111111) << 7) | (o1 & 0b0111_1111))
      );
    const o6 = this.u8();
    if (o6 <= 0b01111111)
      return (
        o6 * 0b100000000000000000000000000000000000 +
        ((o5 & 0b01111111) * 0b10000000000000000000000000000 +
          (((o4 & 0b01111111) << 21) | ((o3 & 0b01111111) << 14) | ((o2 & 0b01111111) << 7) | (o1 & 0b0111_1111)))
      );
    const o7 = this.u8();
    if (o7 <= 0b01111111)
      return (
        o7 * 0b1000000000000000000000000000000000000000000 +
        ((o6 & 0b01111111) * 0b100000000000000000000000000000000000 +
          ((o5 & 0b01111111) * 0b10000000000000000000000000000 +
            (((o4 & 0b01111111) << 21) | ((o3 & 0b01111111) << 14) | ((o2 & 0b01111111) << 7) | (o1 & 0b0111_1111))))
      );
    const o8 = this.u8();
    return (
      o8 * 0b10000000000000000000000000000000000000000000000000 +
      ((o7 & 0b01111111) * 0b1000000000000000000000000000000000000000000 +
        ((o6 & 0b01111111) * 0b100000000000000000000000000000000000 +
          ((o5 & 0b01111111) * 0b10000000000000000000000000000 +
            (((o4 & 0b01111111) << 21) | ((o3 & 0b01111111) << 14) | ((o2 & 0b01111111) << 7) | (o1 & 0b0111_1111)))))
    );
  }

  public vu57Skip(): void {
    const o1 = this.u8();
    if (o1 <= 0b01111111) return;
    const o2 = this.u8();
    if (o2 <= 0b01111111) return;
    const o3 = this.u8();
    if (o3 <= 0b01111111) return;
    const o4 = this.u8();
    if (o4 <= 0b01111111) return;
    const o5 = this.u8();
    if (o5 <= 0b01111111) return;
    const o6 = this.u8();
    if (o6 <= 0b01111111) return;
    const o7 = this.u8();
    if (o7 <= 0b01111111) return;
    this.x++;
  }

  public vu39(): number {
    const o1 = this.u8();
    if (o1 <= 0b01111111) return o1;
    const o2 = this.u8();
    if (o2 <= 0b01111111) return (o2 << 7) | (o1 & 0b01111111);
    const o3 = this.u8();
    if (o3 <= 0b01111111) return (o3 << 14) | ((o2 & 0b01111111) << 7) | (o1 & 0b01111111);
    const o4 = this.u8();
    if (o4 <= 0b01111111) return (o4 << 21) | ((o3 & 0b01111111) << 14) | ((o2 & 0b01111111) << 7) | (o1 & 0b01111111);
    const o5 = this.u8();
    if (o5 <= 0b01111111)
      return (
        o5 * 0b10000000000000000000000000000 +
        (((o4 & 0b01111111) << 21) | ((o3 & 0b01111111) << 14) | ((o2 & 0b01111111) << 7) | (o1 & 0b0111_1111))
      );
    const o6 = this.u8();
    return (
      (o6 & 0b1111) * 0b100000000000000000000000000000000000 +
      ((o5 & 0b01111111) * 0b10000000000000000000000000000 +
        (((o4 & 0b01111111) << 21) | ((o3 & 0b01111111) << 14) | ((o2 & 0b01111111) << 7) | (o1 & 0b0111_1111)))
    );
  }

  public vu39Skip(): void {
    const o1 = this.u8();
    if (o1 <= 0b01111111) return;
    const o2 = this.u8();
    if (o2 <= 0b01111111) return;
    const o3 = this.u8();
    if (o3 <= 0b01111111) return;
    const o4 = this.u8();
    if (o4 <= 0b01111111) return;
    const o5 = this.u8();
    if (o5 <= 0b01111111) return;
    this.x++;
  }

  public b1vu56(): [flag: 0 | 1, value56: number] {
    const byte = this.u8();
    const flag: 0 | 1 = byte & 0b10000000 ? 1 : 0;
    const o1 = 0b0_1_111111 & byte;
    if (o1 <= 0b0_0_111111) return [flag, o1];
    const o2 = this.u8();
    if (o2 <= 0b01111111) return [flag, (o2 << 6) | (o1 & 0b0_0_111111)];
    const o3 = this.u8();
    if (o3 <= 0b01111111) return [flag, (o3 << 13) | ((o2 & 0b01111111) << 6) | (o1 & 0b0_0_111111)];
    const o4 = this.u8();
    if (o4 <= 0b01111111)
      return [flag, (o4 << 20) | ((o3 & 0b01111111) << 13) | ((o2 & 0b01111111) << 6) | (o1 & 0b0_0_111111)];
    const o5 = this.u8();
    if (o5 <= 0b01111111)
      return [
        flag,
        o5 * 0b1000000000000000000000000000 +
          (((o4 & 0b01111111) << 20) | ((o3 & 0b01111111) << 13) | ((o2 & 0b01111111) << 6) | (o1 & 0b0_0_111111)),
      ];
    const o6 = this.u8();
    if (o6 <= 0b01111111)
      return [
        flag,
        o6 * 0b10000000000000000000000000000000000 +
          ((o5 & 0b01111111) * 0b1000000000000000000000000000 +
            (((o4 & 0b01111111) << 20) | ((o3 & 0b01111111) << 13) | ((o2 & 0b01111111) << 6) | (o1 & 0b0_0_111111))),
      ];
    const o7 = this.u8();
    if (o7 <= 0b01111111)
      return [
        flag,
        o7 * 0b100000000000000000000000000000000000000000 +
          ((o6 & 0b01111111) * 0b10000000000000000000000000000000000 +
            ((o5 & 0b01111111) * 0b1000000000000000000000000000 +
              (((o4 & 0b01111111) << 20) |
                ((o3 & 0b01111111) << 13) |
                ((o2 & 0b01111111) << 6) |
                (o1 & 0b0_0_111111)))),
      ];
    const o8 = this.u8();
    return [
      flag,
      o8 * 0b1000000000000000000000000000000000000000000000000 +
        ((o7 & 0b01111111) * 0b100000000000000000000000000000000000000000 +
          ((o6 & 0b01111111) * 0b10000000000000000000000000000000000 +
            ((o5 & 0b01111111) * 0b1000000000000000000000000000 +
              (((o4 & 0b01111111) << 20) |
                ((o3 & 0b01111111) << 13) |
                ((o2 & 0b01111111) << 6) |
                (o1 & 0b0_0_111111))))),
    ];
  }

  public b1vu28(): [flag: boolean, value56: number] {
    const byte = this.u8();
    const flag: boolean = !!(byte & 0b10000000);
    const o1 = 0b0_1_111111 & byte;
    if (o1 <= 0b0_0_111111) return [flag, o1];
    const o2 = this.u8();
    if (o2 <= 0b01111111) return [flag, (o2 << 6) | (o1 & 0b0_0_111111)];
    const o3 = this.u8();
    if (o3 <= 0b01111111) return [flag, (o3 << 13) | ((o2 & 0b01111111) << 6) | (o1 & 0b0_0_111111)];
    const o4 = this.u8();
    return [flag, (o4 << 20) | ((o3 & 0b01111111) << 13) | ((o2 & 0b01111111) << 6) | (o1 & 0b0_0_111111)];
  }

  public b1vu28Skip(): void {
    const byte = this.u8();
    const o1 = 0b0_1_111111 & byte;
    if (o1 <= 0b0_0_111111) return;
    const o2 = this.u8();
    if (o2 <= 0b01111111) return;
    const o3 = this.u8();
    if (o3 <= 0b01111111) return;
    this.x++;
  }

  public u53vu39(): [x: number, z: number] {
    const x32 = this.u32();
    const x16 = this.u16();
    const y = this.u8();
    const z8 = this.u8();
    const x = (((y >>> 3) << 16) | x16) * 0x100000000 + x32;
    const z = ((y & 0b11) << 8) | z8;
    if (!(y & 0b100)) return [x, z];
    const o1 = this.u8();
    if (o1 <= 0b0_1111111) return [x, (o1 << 10) | z];
    const o2 = this.u8();
    if (o2 <= 0b0_1111111) return [x, (o2 << 17) | ((o1 & 0b0_1111111) << 10) | z];
    const o3 = this.u8();
    if (o3 <= 0b0_1111111) return [x, (o3 << 24) | (((o2 & 0b0_1111111) << 17) | ((o1 & 0b0_1111111) << 10) | z)];
    const o4 = this.u8();
    return [
      x,
      o4 * 0b10000000000000000000000000000000 +
        (((o3 & 0b0_1111111) << 24) | (((o2 & 0b0_1111111) << 17) | ((o1 & 0b0_1111111) << 10) | z)),
    ];
  }
}
