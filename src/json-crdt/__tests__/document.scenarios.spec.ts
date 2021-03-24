import {Document} from '../document';
import {PatchBuilder} from '../../json-crdt-patch/PatchBuilder';
import {FALSE_ID, NULL_ID, TRUE_ID, UNDEFINED_ID} from '../../json-crdt-patch/constants';

describe('scenarios', () => {
  test('can edit an object', () => {
    const doc = new Document();
    const builder1 = new PatchBuilder(doc.clock);
    const json = {
      id: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
      name: 'Vadim',
      tags: ['Hello', 'Games'],
      likes: 7,
    };
    const obj1 = builder1.json(json);
    builder1.root(obj1);
    doc.applyPatch(builder1.patch);
    expect(doc.toJson()).toEqual(json);
  });
});
