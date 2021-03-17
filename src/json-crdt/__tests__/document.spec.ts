import {Document} from '../document';

describe('Document', () => {
  test('can add keys', () => {
    const doc = new Document();
    doc.applyPatch([0, 0, [
      [0, 0, 0],
    ]]);
    console.log(doc);
    console.log(doc.toJson());
  });
});
