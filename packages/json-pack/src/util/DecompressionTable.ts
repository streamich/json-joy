import {JsonPackExtension} from '../JsonPackExtension';

const isSafeInteger = Number.isSafeInteger;

export class DecompressionTable {
  protected readonly table: unknown[] = [];

  public importTable(rleTable: unknown[]) {
    const length = rleTable.length;
    if (!length) return;
    const table = this.table;
    const first = rleTable[0];
    table.push(first);
    let i = 1;
    if (isSafeInteger(first)) {
      let prev: number = <number>first;
      let value: unknown;
      while (i < length) {
        value = rleTable[i];
        if (isSafeInteger(value)) {
          prev = prev + <number>value;
          table.push(prev);
          i++;
        } else {
          break;
        }
      }
    }
    while (i < length) table.push(rleTable[i++]);
  }

  public getLiteral(index: number): unknown {
    const table = this.table;
    // if (index < 0 || index >= table.length) throw new Error('OUT_OF_BOUNDS');
    return table[index];
  }

  public decompress(value: unknown): unknown {
    switch (typeof value) {
      case 'number': {
        return this.getLiteral(value);
      }
      case 'object': {
        if (!value) return null;
        const construct = value.constructor;
        switch (construct) {
          case Object: {
            const obj = value as Record<string, unknown>;
            const newObj: Record<string, unknown> = {};
            for (const key in obj) newObj[String(this.getLiteral(Number(key)))] = this.decompress(obj[key]);
            return newObj;
          }
          case Array: {
            const arr = value as unknown[];
            const newArr: unknown[] = [];
            const len = arr.length;
            for (let i = 0; i < len; i++) newArr.push(this.decompress(arr[i]));
            return newArr;
          }
          case Map: {
            const map = value as Map<unknown, unknown>;
            const newMap = new Map<unknown, unknown>();
            map.forEach((value, key) => {
              newMap.set(this.decompress(key), this.decompress(value));
            });
            return newMap;
          }
          case Set: {
            const set = value as Set<unknown>;
            const newSet = new Set<unknown>();
            set.forEach((value) => {
              newSet.add(this.decompress(value));
            });
            break;
          }
          case JsonPackExtension: {
            const ext = value as JsonPackExtension;
            const newExt = new JsonPackExtension(Number(this.getLiteral(ext.tag)), this.decompress(ext.val));
            return newExt;
          }
        }
        return value;
      }
      default: {
        return value;
      }
    }
  }
}
