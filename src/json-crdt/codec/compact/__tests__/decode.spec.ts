import {PatchBuilder} from '../../../../json-crdt-patch/PatchBuilder';
import {Document} from '../../../document';
import {encode} from '../encode';
import {decode} from '../decode';
import {TRUE_ID} from '../../../../json-crdt-patch/constants';

describe('object', () => {
  test('decodes a simple document', () => {
    const doc = new Document;
    const builder = new PatchBuilder(doc.clock);
    const obj = builder.obj();
    const insert = builder.setKeys(obj, [['foo', TRUE_ID]]);
    const root = builder.root(obj);
    doc.applyPatch(builder.patch);
    const encoded = encode(doc);
    // console.log(encoded);
    const doc2 = decode(encoded);
    expect(doc2.toJson()).toEqual({foo: true});
    expect(doc2 !== doc).toBe(true);
    expect(doc2.clock !== doc.clock).toBe(true);
    expect(doc2.clock.sessionId).toBe(doc.clock.sessionId);
    expect(doc2.clock.time).toBe(doc.clock.time);
  });

  test('encodes object with inner object', () => {
    const doc = new Document;
    doc.api.root({foo: {bar: {}}}).commit();
    const encoded = encode(doc);
    // console.log(encoded);
    const doc2 = decode(encoded);
    expect(doc2.toJson()).toEqual({foo: {bar: {}}});
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

  test('can decode number in an object', () => {
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

  test('can decode array with in-the-middle insertion', () => {
    const doc = new Document;
    doc.api.root({a: [1, 2]}).commit();
    doc.api.arrIns(['a'], 1, [3]).commit();
    const encoded = encode(doc);
    const doc2 = decode(encoded);
    expect(doc2.toJson()).toEqual({a: [1, 3, 2]});
  });
});

describe('string', () => {
  test('can decode string as root', () => {
    const doc = new Document;
    doc.api.root('abc').commit();
    const encoded = encode(doc);
    const doc2 = decode(encoded);
    expect(doc2.toJson()).toEqual('abc');
  });

  test('can decode a string with insertion at depth 2', () => {
    const doc = new Document;
    doc.api.root([{code: 'function () {}'}]).commit();
    doc.api.strIns([0, 'code'], 13, ' console.log("abc"); ').commit();
    const encoded = encode(doc);
    // console.log(encoded);
    expect(doc.toJson()).toEqual([ { code: 'function () { console.log("abc"); }' } ]);
    const doc2 = decode(encoded);
    expect(doc2.toJson()).toEqual([ { code: 'function () { console.log("abc"); }' } ]);
  });
});

