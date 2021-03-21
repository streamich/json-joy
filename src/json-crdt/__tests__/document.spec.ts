import {PatchBuilder} from '../../json-crdt-patch/PatchBuilder';
import {FALSE_ID, NULL_ID, ORIGIN, TRUE_ID} from '../constants';
import {Document} from '../document';

describe('Document', () => {
  test('default root value is undefined', () => {
    const doc = new Document();
    expect(doc.toJson()).toBe(undefined);
  });

  test('can set root value to "true"', () => {
    const doc = new Document();
    const builder = new PatchBuilder(doc.clock);
    builder.root(ORIGIN, TRUE_ID);
    doc.applyPatch(builder.patch);
    expect(doc.toJson()).toBe(true);
  });

  test('can set root value to "false"', () => {
    const doc = new Document();
    const builder = new PatchBuilder(doc.clock);
    builder.root(ORIGIN, TRUE_ID);
    builder.root(ORIGIN, FALSE_ID);
    doc.applyPatch(builder.patch);
    expect(doc.toJson()).toBe(false);
  });

  test('can set root value to "null"', () => {
    const doc = new Document();
    const builder = new PatchBuilder(doc.clock);
    builder.root(ORIGIN, TRUE_ID);
    builder.root(ORIGIN, FALSE_ID);
    builder.root(ORIGIN, NULL_ID);
    doc.applyPatch(builder.patch);
    expect(doc.toJson()).toBe(null);
  });
});
