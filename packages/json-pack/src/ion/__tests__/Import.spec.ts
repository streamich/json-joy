import {Import} from '../Import';
import {systemSymbolImport, systemSymbolTable} from '../symbols';

test('can instantiate symbols to local symbol table import', () => {
  const imp = new Import(systemSymbolImport, ['foo', 'bar']);
  const fooId = imp.getId('foo');
  const barId = imp.getId('bar');
  expect(fooId).toBe(systemSymbolTable.length + 1);
  expect(barId).toBe(systemSymbolTable.length + 2);
  const barText = imp.getText(systemSymbolTable.length + 1);
  const fooText = imp.getText(systemSymbolTable.length + 2);
  expect(barText).toBe('foo');
  expect(fooText).toBe('bar');
});

test('can add symbols to the local symbol table import', () => {
  const imp = new Import(systemSymbolImport, ['foo', 'bar']);
  imp.add('baz');
  imp.add('__proto__');
  const id1 = imp.getId('baz');
  const id2 = imp.getId('__proto__');
  expect(id1).toBe(systemSymbolTable.length + 3);
  expect(id2).toBe(systemSymbolTable.length + 4);
  const text1 = imp.getText(systemSymbolTable.length + 3);
  const text2 = imp.getText(systemSymbolTable.length + 4);
  expect(text1).toBe('baz');
  expect(text2).toBe('__proto__');
});

test('returns ID of new local symbol', () => {
  const imp = new Import(systemSymbolImport, []);
  const id = imp.add('baz');
  expect(id).toBe(systemSymbolTable.length + 1);
  const id2 = imp.getId('baz');
  expect(id2).toBe(systemSymbolTable.length + 1);
});

test('returns same ID when adding symbol with the same text', () => {
  const imp = new Import(systemSymbolImport, []);
  const id1 = imp.add('baz');
  const id2 = imp.add('bar');
  const id3 = imp.add('baz');
  expect(id1).toBe(id3);
  expect(id1).not.toBe(id2);
  expect(imp.add('bar')).toBe(id2);
  expect(imp.add('bar')).toBe(id2);
});
