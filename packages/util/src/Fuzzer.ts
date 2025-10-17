import {randomBytes} from 'crypto';

function xoshiro128ss(a: number, b: number, c: number, d: number) {
  return () => {
    const t = b << 9;
    let r = b * 5;
    r = ((r << 7) | (r >>> 25)) * 9;
    c ^= a;
    d ^= b;
    b ^= c;
    a ^= d;
    c ^= t;
    d = (d << 11) | (d >>> 21);
    return (r >>> 0) / 4294967296;
  };
}

export class Fuzzer {
  public static randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  public static randomInt2([min, max]: [min: number, max: number]): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /** @deprecated */
  public static pick<T>(elements: T[]): T {
    return elements[Math.floor(Math.random() * elements.length)];
  }

  /** @deprecated */
  public static repeat<T>(times: number, callback: () => T): T[] {
    const result: T[] = [];
    for (let i = 0; i < times; i++) result.push(callback());
    return result;
  }

  public readonly seed: Buffer;
  public readonly random: () => number;

  constructor(seed?: Buffer) {
    this.seed = seed = seed || randomBytes(4 * 4);
    let i = 0;
    const a = (seed[i++] << 24) | (seed[i++] << 16) | (seed[i++] << 8) | seed[i++];
    const b = (seed[i++] << 24) | (seed[i++] << 16) | (seed[i++] << 8) | seed[i++];
    const c = (seed[i++] << 24) | (seed[i++] << 16) | (seed[i++] << 8) | seed[i++];
    const d = (seed[i++] << 24) | (seed[i++] << 16) | (seed[i++] << 8) | seed[i++];
    this.random = xoshiro128ss(a, b, c, d);
    Math.random = this.random;
  }

  public readonly randomInt = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  public readonly pick = <T>(elements: T[]): T => {
    return elements[Math.floor(Math.random() * elements.length)];
  };

  public readonly repeat = <T>(times: number, callback: () => T): T[] => {
    const result: T[] = [];
    for (let i = 0; i < times; i++) result.push(callback());
    return result;
  };
}
