import {PatchBuilder} from '../../../../json-crdt-patch/PatchBuilder';
import {Document} from '../../../document';
import {encode} from '../encode';
import {decode} from '../decode';
import {TRUE_ID} from '../../../../json-crdt-patch/constants';

describe('object', () => {
  test('encodes a simple document', () => {
    const doc = new Document;
    const builder = new PatchBuilder(doc.clock);
    const obj = builder.obj();
    const insert = builder.setKeys(obj, [['foo', TRUE_ID]]);
    const root = builder.root(obj);
    doc.applyPatch(builder.patch);
    const encoded = encode(doc);
    const doc2 = decode(encoded);
    expect(doc2.toJson()).toEqual({foo: true});
    expect(doc2 !== doc).toBe(true);
    expect(doc2.clock !== doc.clock).toBe(true);
    expect(doc2.clock.sessionId).toBe(doc.clock.sessionId);
    expect(doc2.clock.time).toBe(doc.clock.time);
  });
});

describe('number', () => {
  test('can decode number as root', () => {
    const doc = new Document;
    doc.api.root(99).commit();
    const encoded = encode(doc);
    const doc2 = decode(encoded);
    expect(doc2.toJson()).toBe(99);
    expect(doc2 !== doc).toBe(true);
    expect(doc2.clock !== doc.clock).toBe(true);
    expect(doc2.clock.sessionId).toBe(doc.clock.sessionId);
    expect(doc2.clock.time).toBe(doc.clock.time);
  });

  test('can decode number as root', () => {
    const doc = new Document;
    doc.api.root({foo: {bar: 1.2}}).commit();
    const encoded = encode(doc);
    const doc2 = decode(encoded);
    expect(doc2.toJson()).toEqual({foo: {bar: 1.2}});
  });
});

describe('array', () => {
  test('can decode number as root', () => {
    const doc = new Document;
    doc.api.root([true]).commit();
    const encoded = encode(doc);
    const doc2 = decode(encoded);
    expect(doc2.toJson()).toEqual([true]);
  });

  test('can decode number as root', () => {
    const doc = new Document;
    const json: any = [1, 2, true, false, null, {}, [1], []];
    doc.api.root(json).commit();
    const encoded = encode(doc);
    const doc2 = decode(encoded);
    expect(doc2.toJson()).toEqual(json);
  });
});
