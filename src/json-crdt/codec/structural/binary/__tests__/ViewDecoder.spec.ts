import {Timestamp, ClockVector} from '../../../../../json-crdt-patch/clock';
import {Model} from '../../../../model';
import {Encoder} from '../Encoder';
import {Decoder} from '../Decoder';
import {ViewDecoder} from '../ViewDecoder';
import {konst} from '../../../../../json-crdt-patch/builder/Konst';

describe('logical', () => {
  test('can decode various documents', () => {
    const doc1 = Model.create(void 0, new ClockVector(222, 1));
    const encoder = new Encoder();
    const viewDecoder = new ViewDecoder();
    const decoder = new Decoder();
    const assertCanDecode = () => {
      const encoded = encoder.encode(doc1);
      const decoded = viewDecoder.decode(encoded);
      const decoded2 = decoder.decode(encoded).view();
      // console.log(decoded);
      // console.log(decoded2);
      // console.log(doc1.view());
      expect(decoded).toStrictEqual(doc1.view());
      expect(decoded2).toStrictEqual(doc1.view());
    };
    assertCanDecode();
    doc1.api.set([1, 'asdf', false, {}, {foo: 'bar', s: {foo: 'foo'}}]);
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

  test('decodes "con" timestamp as null', () => {
    const model = Model.create();
    model.api.set({
      foo: konst(new Timestamp(model.clock.sid, 2)),
    });
    const encoder = new Encoder();
    const viewDecoder = new ViewDecoder();
    const encoded = encoder.encode(model);
    const view = viewDecoder.decode(encoded);
    expect((view as any).foo).toBe(null);
  });

  test('can decode a simple number', () => {
    const model = Model.create();
    model.api.set(123);
    const encoder = new Encoder();
    const viewDecoder = new ViewDecoder();
    const encoded = encoder.encode(model);
    const view = viewDecoder.decode(encoded);
    expect(view).toStrictEqual(123);
  });

  test('can decode a simple string', () => {
    const model = Model.create();
    model.api.set('asdf');
    const encoder = new Encoder();
    const viewDecoder = new ViewDecoder();
    const encoded = encoder.encode(model);
    const view = viewDecoder.decode(encoded);
    expect(view).toStrictEqual('asdf');
  });

  test('can decode a simple object', () => {
    const model = Model.create();
    model.api.set({yes: false});
    const encoder = new Encoder();
    const viewDecoder = new ViewDecoder();
    const encoded = encoder.encode(model);
    const view = viewDecoder.decode(encoded);
    expect(view).toStrictEqual({yes: false});
  });
});
