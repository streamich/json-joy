import {Document} from '../document';

describe('Document', () => {
  test('can add keys', () => {
    const doc = new Document();
    const patch = doc.patch();
    const object = patch.makeObject();
    patch.insertRoot(object.id);
    // const strId = patch.makeString();
    // patch.insertObject

    // doc.insertObject(doc.clock.tick(1), SINGULARITY);
    // doc.makeObject(doc.clock.tick(1));
    // doc.applyObjectInsertKeyOperation(doc.clock.tick(1), SINGULARITY);
    
    console.log(object);
    console.log(doc);
    console.log(doc.toJson());
  });
});
