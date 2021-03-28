import {PatchBuilder} from '../../../../json-crdt-patch/PatchBuilder';
import {Document} from '../../../document';
import {encode} from '../encode';
import {TRUE_ID} from '../../../../json-crdt-patch/constants';

describe('objects', () => {
  test('encodes a simple document', () => {
    const doc = new Document;
    const builder = new PatchBuilder(doc.clock);
    const obj = builder.obj();
    const insert = builder.setKeys(obj, [['foo', TRUE_ID]]);
    const root = builder.root(obj);
    doc.applyPatch(builder.patch);
    const encoded = encode(doc);
    expect(JSON.parse(encoded)).toEqual([
      [
        doc.clock.sessionId,
        doc.clock.time,
      ],
      1, 1, 1, 3,
      [
        0,
        1, doc.clock.time - obj.time,
        1,
        'foo',
        1, doc.clock.time - insert.time,
        TRUE_ID.sessionId, TRUE_ID.time,
      ],
    ]);
  });

  test('deletes old root object nodes', () => {
    const doc = new Document;
    doc.api.root({foo: 123}).commit();
    doc.api.root({gaga: 666}).commit();
    const encoded = encode(doc);
    const obj = doc.api.asObj([]);
    const num = doc.api.asNum(['gaga']);
    expect(JSON.parse(encoded)).toEqual([
      [
        doc.clock.sessionId,
        doc.clock.time,
      ],
      1, 1, 1, doc.clock.time - obj.id.time,
      [
        0,
        1, doc.clock.time - obj.id.time,
        1,
        'gaga',
        1, 2,
        1, doc.clock.time - num.id.time,
      ],
      [
        3,
        1, doc.clock.time - num.id.time,
        1, doc.clock.time - num.writeId.time,
        num.value,
      ],
    ]);
  });
});

describe('numbers', () => {
  test('can encode a number', () => {
    const doc = new Document;
    const api = doc.api;
    api.root(123).commit();
    const encoded = encode(doc);
    const num = api.asNum([]);
    expect(JSON.parse(encoded)).toEqual([
      [
        doc.clock.sessionId,
        doc.clock.time,
      ],
      1, 1, 1, doc.clock.time - num.id.time,
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
    const num = api.asNum([]);
    expect(JSON.parse(encoded)).toEqual([
      [
        doc.clock.sessionId,
        doc.clock.time,
      ],
      1, 1, 1, doc.clock.time - num.id.time,
      [
        3,
        1, doc.clock.time - num.id.time,
        1, doc.clock.time - num.writeId.time,
        num.value,
      ],
    ]);
  });
});
