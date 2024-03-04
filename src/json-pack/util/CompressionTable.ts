import {JsonPackExtension} from "../JsonPackExtension";

const isSafeInteger = Number.isSafeInteger;

export class CompressionTable {
  public static from(value: unknown): CompressionTable {
    const table = new CompressionTable();
    table.from(value);
    return table;
  }

  protected integers = new Set<number>();
  protected nonIntegers = new Set<unknown>();

  protected table: unknown[] = [];
  protected map: Map<unknown, number> = new Map();

  public addInteger(int: number): void {
    this.integers.add(int);
  }

  public addLiteral(value: number | string | unknown): void {
    if (isSafeInteger(value)) {
      this.addInteger(value as number);
      return;
    }
    this.nonIntegers.add(value);
  }

  public from(value: unknown): void {
    switch (typeof value) {
      case 'object': {
        if (!value) return this.addLiteral(null);
        const constructor = value.constructor;
        switch (constructor) {
          case Object: {
            const obj = value as Record<string, unknown>;
            for (const key in obj) {
              this.addLiteral(key);
              this.from(obj[key]);
            }
            break;
          }
          case Array: {
            const arr = value as unknown[];
            const len = arr.length;
            for (let i = 0; i < len; i++) this.from(arr[i]);
            break;
          }
          case Map: {
            const map = value as Map<unknown, unknown>;
            map.forEach((value, key) => {
              this.from(key);
              this.from(value);
            });
            break;
          }
          case Set: {
            const set = value as Set<unknown>;
            set.forEach((value) => {
              this.from(value);
            });
            break;
          }
          case JsonPackExtension: {
            const ext = value as JsonPackExtension;
            this.addInteger(ext.tag);
            this.from(ext.val);
          }
        }
        return;
      }
      default:
        return this.addLiteral(value);
    }
  }

  public finalize(): void {
    const integers = Array.from(this.integers).sort();
    const len = integers.length;
    if (len > 0) {
      const first = integers[0];
      this.table[0] = first;
      this.map.set(first, 0);
      let last = first;
      for (let i = 1; i < len; i++) {
        const int = integers[i];
        this.table.push(int - last);
        this.map.set(int, i);
        last = int;
      }
    }
    this.integers.clear();
    this.nonIntegers.clear();
  }
}
