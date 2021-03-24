import {OpAdd} from '../../json-patch/op';
import {Document} from '../document';
import {JsonPatch} from '../JsonPatch';

describe('add', () => {
  test('can set the root value', () => {
    const doc = new Document();
    const jsonPatch = doc.jsonPatch();
    const draft = jsonPatch.fromOps([
      new OpAdd([], true),
    ]);
    const patch = draft.patch(doc.clock);
    doc.applyPatch(patch);
    doc.applyPatch(patch);
    expect(doc.toJson()).toBe(true);
  });

  test('can set the string as root value', () => {
    const doc = new Document();
    const jsonPatch = doc.jsonPatch();
    const draft = jsonPatch.fromOps([
      new OpAdd([], 'hello world'),
    ]);
    const patch = draft.patch(doc.clock);
    doc.applyPatch(patch);
    doc.applyPatch(patch);
    expect(doc.toJson()).toBe('hello world');
  });

  test('can set object as root value', () => {
    const doc = new Document();
    const jsonPatch = doc.jsonPatch();
    const draft = jsonPatch.fromOps([
      new OpAdd([], {a: [1, null]}),
    ]);
    const patch = draft.patch(doc.clock);
    doc.applyPatch(patch);
    doc.applyPatch(patch);
    expect(doc.toJson()).toEqual({a: [1, null]});
  });
});