import {PatchBuilder} from '../../../../json-crdt-patch/PatchBuilder';
import {Document} from '../../../document';
import {encode} from '../encode';
import {TRUE_ID} from '../../../../json-crdt-patch/constants';

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
    root.sessionId,
    root.time,
    obj.sessionId,
    obj.time,
    [
      0,
      obj.sessionId,
      obj.time,
      1,
      'foo',
      insert.sessionId,
      insert.time,
      TRUE_ID.sessionId,
      TRUE_ID.time,
    ],
  ]);
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
      doc.root.last!.id.sessionId,
      doc.root.last!.id.time,
      doc.root.last!.value.sessionId,
      doc.root.last!.value.time,
      [
        3,
        num.id.sessionId,
        num.id.time,
        num.writeId.sessionId,
        num.writeId.time,
        num.value,
      ],
    ]);
  });

  test('state keeps only the latest number version', () => {
    const doc = new Document;
    const api = doc.api;
    api.root(123).commit();
    api.root(124).commit();
    const encoded = encode(doc);
    const num = api.asNum([]);
    expect(JSON.parse(encoded)).toEqual([
      [
        doc.clock.sessionId,
        doc.clock.time,
      ],
      doc.root.last!.id.sessionId,
      doc.root.last!.id.time,
      doc.root.last!.value.sessionId,
      doc.root.last!.value.time,
      [
        3,
        num.id.sessionId,
        num.id.time,
        num.writeId.sessionId,
        num.writeId.time,
        num.value,
      ],
    ]);
  });
});
