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

  test('decodes object with inner object', () => {
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

  test('decodes object with three keys', () => {
    const doc = new Document;
    doc.api.root({foo: 1, bar: 2, baz: 3}).commit();
    const encoded = encode(doc);
    const doc2 = decode(encoded);
    expect(doc.toJson()).toEqual({foo: 1, bar: 2, baz: 3});
    expect(doc2.toJson()).toEqual({foo: 1, bar: 2, baz: 3});
  });

  test('decodes object with no keys', () => {
    const doc = new Document;
    doc.api.root({}).commit();
    const encoded = encode(doc);
    const doc2 = decode(encoded);
    expect(doc.toJson()).toEqual({});
    expect(doc2.toJson()).toEqual({});
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

describe('complex cases', () => {
  test('can encode/decode multiple times modified user object', () => {
    const doc = new Document;
    const check = () => expect(decode(encode(doc)).toJson()).toEqual(doc.toJson());  
    doc.api.root({
      name: 'Mike Brown',
      employer: 'Filecoin Inc',
      age: 177,
      tags: ['News', 'Sports'],
      emailVerified: false,
      email: null,
    }).commit();
    check();
    doc.api
      .strIns(['name'], 10, ' Jr.')
      .numSet(['age'], 2077)
      .arrIns(['tags'], 0, ['Cyberpunk', 'GTA 4'])
      .commit();
    check();
    doc.api
      .strIns(['tags', 0], 9, ' 2077')
      .arrIns(['tags'], 2, ['GTA 5'])
      .arrDel(['tags'], 2, 2)
      .commit();
    check();
    doc.api
      .objSet([], {
        email: 'cyber.mike@gpost.com',
        emailVerified: 'likely',
      })
      .commit();
    check();
    const encoded = encode(doc);
    const doc2 = decode(encoded);
    expect(doc2.toJson()).toEqual(doc.toJson());
    expect(decode(encode(doc2)).toJson()).toEqual(doc.toJson());
    expect(doc.toJson()).toEqual({
      name: 'Mike Brown Jr.',
      employer: 'Filecoin Inc',
      age: 2077,
      tags: [ 'Cyberpunk 2077', 'GTA 4', 'GTA 5' ],
      emailVerified: 'likely',
      email: 'cyber.mike@gpost.com'
    });
  });
});

