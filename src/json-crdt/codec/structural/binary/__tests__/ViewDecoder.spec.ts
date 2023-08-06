import {Timestamp, VectorClock, equal} from '../../../../../json-crdt-patch/clock';
import {Model} from '../../../../model';
import {Encoder} from '../Encoder';
import {Decoder} from '../Decoder';
import {ViewDecoder} from '../ViewDecoder';
import {konst} from '../../../../../json-crdt-patch/builder/Konst';

describe('logical', () => {
  test('decodes clock', () => {
    const doc1 = Model.withLogicalClock(new VectorClock(222, 1));
    const encoder = new Encoder();
    const viewDecoder = new ViewDecoder();
    const decoder = new Decoder();
    const assertCanDecode = () => {
      const encoded = encoder.encode(doc1);
      const decoded = viewDecoder.decode(encoded);
      const decoded2 = decoder.decode(encoded).view();
      expect(decoded).toStrictEqual(doc1.view());
      expect(decoded2).toStrictEqual(doc1.view());
    };
    assertCanDecode();
    doc1.api.root([1, 'asdf', false, {}, {foo: 'bar', s: {foo: 'foo'}}]);
    assertCanDecode();
    doc1.api.str([1]).ins(4, '!');
    assertCanDecode();
    doc1.api.str([4, 'foo']).del(1, 1);
    assertCanDecode();
    doc1.api.arr([]).ins(1, [new Uint8Array([1, 2, 3])]);
    assertCanDecode();
    doc1.api.bin([1]).del(2, 1);
    assertCanDecode();
    doc1.api.arr([]).ins(6, ['a', 'b', 'c']);
    assertCanDecode();
    doc1.api.arr([]).del(7, 1);
    assertCanDecode();
    doc1.api.obj([4]).set({a: 1, b: true});
    assertCanDecode();
    doc1.api.obj([4]).del(['a']);
    assertCanDecode();
  });

  test('can decode ID as const value', () => {
    const model = Model.withLogicalClock();
    model.api.root({
      foo: konst(new Timestamp(model.clock.sid, 2)),
    });
    const encoder = new Encoder();
    const viewDecoder = new ViewDecoder();
    const encoded = encoder.encode(model);
    const view = viewDecoder.decode(encoded);
    expect((view as any).foo).toBe(null);
  });
});
