import {CompressionTable} from '../CompressionTable';
import {DecompressionTable} from '../DecompressionTable';

describe('.importTable()', () => {
  test('can import back compression table', () => {
    const json = {
      a: [-10, -5, 5, 100],
      b: [true, false, null, null],
      c: 'c',
    };
    const table = CompressionTable.create(json);
    const decompressionTable = new DecompressionTable();
    decompressionTable.importTable(table.getTable());
    expect(decompressionTable.getLiteral(0)).toBe(-10);
    expect(decompressionTable.getLiteral(1)).toBe(-5);
    expect(decompressionTable.getLiteral(2)).toBe(5);
    expect(decompressionTable.getLiteral(3)).toBe(100);
    expect(decompressionTable.getLiteral(table.getIndex(true))).toBe(true);
    expect(decompressionTable.getLiteral(table.getIndex(false))).toBe(false);
    expect(decompressionTable.getLiteral(table.getIndex(null))).toBe(null);
    expect(decompressionTable.getLiteral(table.getIndex('a'))).toBe('a');
    expect(decompressionTable.getLiteral(table.getIndex('b'))).toBe('b');
    expect(decompressionTable.getLiteral(table.getIndex('c'))).toBe('c');
  });
});

describe('.decompress()', () => {
  test('can decompress a document', () => {
    const json = {
      a: [-10, -5, 5, 100],
      b: [true, false, null, null],
      c: 'c',
    };
    const table = CompressionTable.create(json);
    const compressed = table.compress(json);
    const decompressionTable = new DecompressionTable();
    decompressionTable.importTable(table.getTable());
    const decompressed = decompressionTable.decompress(compressed);
    expect(decompressed).toEqual(json);
  });
});
