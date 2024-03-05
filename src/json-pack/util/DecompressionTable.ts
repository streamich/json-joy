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
}
