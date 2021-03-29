import {PatchBuilder} from '../../../../json-crdt-patch/PatchBuilder';
import {Document} from '../../../document';
import {encode} from '../encode';
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
    // console.log(encoded);
    expect(JSON.parse(encoded)).toEqual([
      [
        doc.clock.sessionId,
        doc.clock.time,
      ],
      1, 1,
      [
        0,
        1, doc.clock.time - obj.time,
        'foo',
        1, doc.clock.time - insert.time,
        [5],
      ],
    ]);
  });

  test('deletes old root object nodes', () => {
    const doc = new Document;
    doc.api.root({foo: 123}).commit();
    doc.api.root({gaga: 666}).commit();
    const encoded = encode(doc);
    // console.log(encoded);
    const obj = doc.api.asObj([]);
    const num = doc.api.asNum(['gaga']);
    expect(JSON.parse(encoded)).toEqual([
      [
        doc.clock.sessionId,
        doc.clock.time,
      ],
      1, 1,
      [
        0,
        1, doc.clock.time - obj.id.time,
        'gaga',
        1, 2,
        [
          3,
          1, doc.clock.time - num.id.time,
          1, doc.clock.time - num.writeId.time,
          num.value,
        ],
      ],
    ]);
  });
});

describe('number', () => {
  test('can encode a number', () => {
    const doc = new Document;
    const api = doc.api;
    api.root(123).commit();
    const encoded = encode(doc);
    // console.log(encoded);
    const num = api.asNum([]);
    expect(JSON.parse(encoded)).toEqual([
      [
        doc.clock.sessionId,
        doc.clock.time,
      ],
      1, 1,
      [
        3,
        1, doc.clock.time - num.id.time,
        1, doc.clock.time - num.writeId.time,
        num.value,
      ],
    ]);
  });

  test('state keeps only the latest number version', () => {
    const doc = new Document;
    const api = doc.api;
    api.root(1).commit();
    api.root(2).commit();
    api.root(123).commit();
    api.root(124).commit();
    const encoded = encode(doc);
    // console.log(encoded);
    const num = api.asNum([]);
    expect(JSON.parse(encoded)).toEqual([
      [
        doc.clock.sessionId,
        doc.clock.time,
      ],
      1, 1,
      [
        3,
        1, doc.clock.time - num.id.time,
        1, doc.clock.time - num.writeId.time,
        num.value,
      ],
    ]);
  });
});

describe('array', () => {
  test('can encode an array', () => {
    const doc = new Document();
    // doc.api.root([1, 2, {}, false, true, null, [1], []]).commit();
    doc.api.root([1]).commit();
    const encoded = encode(doc);
    // console.log(encoded);
    const arr = doc.api.asArr([]);
    const num = doc.api.asNum([0]);
    expect(JSON.parse(encoded)).toEqual([
      [
        doc.clock.sessionId,
        doc.clock.time,
      ],
      1, 1,
      [
        1,
        1, doc.clock.time - arr.id.time,
        1, 2,
        [
          [
            3,
            1, doc.clock.time - num.id.time,
            1, doc.clock.time - num.writeId.time,
            num.value,
          ],
        ],
      ],
    ]);
  });
});
