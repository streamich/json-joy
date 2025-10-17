import {JsonPackExtension} from '../JsonPackExtension';

const isSafeInteger = Number.isSafeInteger;

export class CompressionTable {
  public static create(value: unknown): CompressionTable {
    const table = new CompressionTable();
    table.walk(value);
    table.finalize();
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

  public walk(value: unknown): void {
    switch (typeof value) {
      case 'object': {
        if (!value) return this.addLiteral(null);
        const construct = value.constructor;
        switch (construct) {
          case Object: {
            const obj = value as Record<string, unknown>;
            for (const key in obj) {
              this.addLiteral(key);
              this.walk(obj[key]);
            }
            break;
          }
          case Array: {
            const arr = value as unknown[];
            const len = arr.length;
            for (let i = 0; i < len; i++) this.walk(arr[i]);
            break;
          }
          case Map: {
            const map = value as Map<unknown, unknown>;
            map.forEach((value, key) => {
              this.walk(key);
              this.walk(value);
            });
            break;
          }
          case Set: {
            const set = value as Set<unknown>;
            set.forEach((value) => {
              this.walk(value);
            });
            break;
          }
          case JsonPackExtension: {
            const ext = value as JsonPackExtension;
            this.addInteger(ext.tag);
            this.walk(ext.val);
          }
        }
        return;
      }
      default:
        return this.addLiteral(value);
    }
  }

  public finalize(): void {
    const integers = Array.from(this.integers);
    integers.sort((a, b) => a - b);
    const len = integers.length;
    const table = this.table;
    const map = this.map;
    if (len > 0) {
      const first = integers[0];
      table.push(first);
      map.set(first, 0);
      let last = first;
      for (let i = 1; i < len; i++) {
        const int = integers[i];
        table.push(int - last);
        map.set(int, i);
        last = int;
      }
    }
    const nonIntegers = Array.from(this.nonIntegers);
    nonIntegers.sort();
    const lenNonIntegers = nonIntegers.length;
    for (let i = 0; i < lenNonIntegers; i++) {
      const value = nonIntegers[i];
      table.push(value);
      map.set(value, len + i);
    }
    this.integers.clear();
    this.nonIntegers.clear();
  }

  public getIndex(value: unknown): number {
    const index = this.map.get(value);
    if (index === undefined) throw new Error(`Value [${value}] not found in compression table.`);
    return index;
  }

  public getTable(): unknown[] {
    return this.table;
  }

  public compress(value: unknown): unknown {
    switch (typeof value) {
      case 'object': {
        if (!value) return this.getIndex(null);
        const construct = value.constructor;
        switch (construct) {
          case Object: {
            const obj = value as Record<string, unknown>;
            const newObj: Record<string, unknown> = {};
            for (const key in obj) newObj[this.getIndex(key)] = this.compress(obj[key]);
            return newObj;
          }
          case Array: {
            const arr = value as unknown[];
            const newArr: unknown[] = [];
            const len = arr.length;
            for (let i = 0; i < len; i++) newArr.push(this.compress(arr[i]));
            return newArr;
          }
          case Map: {
            const map = value as Map<unknown, unknown>;
            const newMap = new Map<unknown, unknown>();
            map.forEach((value, key) => {
              newMap.set(this.compress(key), this.compress(value));
            });
            return newMap;
          }
          case Set: {
            const set = value as Set<unknown>;
            const newSet = new Set<unknown>();
            set.forEach((value) => {
              newSet.add(this.compress(value));
            });
            break;
          }
          case JsonPackExtension: {
            const ext = value as JsonPackExtension;
            const newExt = new JsonPackExtension(this.getIndex(ext.tag), this.compress(ext.val));
            return newExt;
          }
        }
        throw new Error('UNEXPECTED_OBJECT');
      }
      default: {
        return this.getIndex(value);
      }
    }
  }
}
