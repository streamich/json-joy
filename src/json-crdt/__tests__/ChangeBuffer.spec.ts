import {Document} from '../document';

test('can edit strings', () => {
  const doc = new Document();
  const changes = doc.changes;
  changes.root('');
  changes.strIns([], 0, 'var foo = bar');
  changes.strIns([], 9, '"');
  changes.strIns([], 13, '";');
  changes.strDel([], 0, 3);
  changes.strIns([], 0, 'const');
  expect(doc.toJson()).toBe('const foo = "bar";');
});
