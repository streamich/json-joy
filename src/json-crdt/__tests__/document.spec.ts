import {Document} from '../document';

describe('Document', () => {
  test('can add keys', () => {
    const doc = new Document();
    doc.applyPatch([1, 0, [
      [0, 0, 0],
      [1, 1, 0, 'foo'],
    ]]);
    console.log(doc);
    console.log(doc.root.end);
    console.log(doc.toJson());
  });
});
